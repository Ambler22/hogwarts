import http from "node:http";
import url from "node:url";
import fs from "node:fs/promises";
import path from "node:path";

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import handlebars from "handlebars";

import { parseFormData, redirect, json } from "./utils.mjs";

const HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
const PORT = process.env.PORT || 8000;
const PUBLIC_PATH = path.join(process.cwd(), "public");

var db = await open({
  filename: "hogwarts.db",
  driver: sqlite3.Database,
});

handlebars.registerHelper("select", function (selected, options) {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"');
});

var House = {
  GRYFFINDOR: "Gryffindor",
  SLYTHERIN: "Slytherin",
  HUFFLEPUFF: "Hufflepuff",
  RAVENCLAW: "Ravenclaw",
};

var HOUSES = Object.values(House);

var routes = [
  {
    path: "/",
    methods: ["GET"],
    handler: index,
  },
  {
    path: "/students",
    methods: ["GET", "POST"],
    handler: studentList,
  },
  {
    path: "/students/delete",
    methods: ["POST"],
    handler: studentDelete,
  },
  {
    path: "/students/:id/change",
    methods: ["GET", "POST"],
    handler: studentChange,
  },
  {
    path: "/students/download",
    methods: ["GET"],
    handler: studentsDownload,
  },
  {
    path: "/students/search",
    methods: ["GET"],
    handler: studentsSearch,
  },
  {
    path: "/api/students",
    methods: ["GET"],
    handler: studentsAPISearch,
  },
];

for (let route of routes) {
  route.pattern = new RegExp(
    "^" + route.path.replace(/:([\w.]+)/, "(?<$1>[\\w.]+)") + "$"
  );
}

var MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=utf-8",
  js: "text/javascript",
  mjs: "text/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

var server = http.createServer(async function handleRequest(request, response) {
  var parsedURL = url.parse(request.url);

  var originalEnd = response.end;

  response.end = function monkeyPatchedEnd(chunk, encoding, cb) {
    console.log(request.method, request.url, response.statusCode);
    return originalEnd.call(this, chunk, encoding, cb);
  };

  if (request.url.endsWith("/")) {
    redirect(request, response, request.url.slice(0, -1), 301);
    return;
  }

  if (request.url.startsWith("/public/")) {
    let filePath = path.join(PUBLIC_PATH, request.url.replace("/public/", ""));
    let fileExists = await fs.access(filePath).then(
      () => true,
      () => false
    );
    let fileFound = filePath.startsWith(PUBLIC_PATH) && fileExists;
    if (!fileFound) {
      response
        .writeHead(404, { "Content-Type": "text/html" })
        .end("<h1>Not found!</h1>\n");
    } else {
      let fileExt = path.extname(filePath).slice(1).toLowerCase();
      let mimeType = MIME_TYPES[fileExt] ?? MIME_TYPES.default;
      let buffer = await fs.readFile(filePath);
      response.writeHead(200, { "Content-Type": mimeType }).end(buffer);
    }
    return;
  }

  for (let route of routes) {
    let match = route.pattern.exec(parsedURL.pathname);
    if (!match) {
      continue;
    }
    if (route.methods.includes(request.method)) {
      let params = match.groups ?? {};
      route.handler(request, response, params);
    } else {
      response.writeHead(405).end();
    }
    return;
  }

  response
    .writeHead(404, { "Content-Type": "text/html" })
    .end("<h1>Page not found!</h1>\n");
});

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
function index(request, response) {
  redirect(request, response, "/students");
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
async function studentList(request, response) {
  var parsedURL = url.parse(request.url);

  if (request.method == "POST") {
    let formData = await parseFormData(request);

    let studentName = formData.get("name");
    let studentHouse = formData.get("house");

    if (studentName && HOUSES.includes(studentHouse)) {
      let isUniqueStudent =
        (
          await db.get(
            "SELECT EXISTS(SELECT 1 FROM students WHERE name = ?) AS exists_",
            studentName
          )
        ).exists_ == 0;

      if (isUniqueStudent) {
        await db.run(
          "INSERT INTO students (name, house) VALUES (?, ?)",
          studentName,
          studentHouse
        );
      }
    }

    redirect(request, response, "/students");
  } else {
    let searchParams = new URLSearchParams(parsedURL.query);
    let order = searchParams.get("order");

    let query = "SELECT id, name, house, image FROM students";
    if (order == "abc") {
      query += " ORDER BY name ASC";
    } else if (order == "zyx") {
      query += " ORDER BY name DESC";
    }

    let students = await db.all(query);
    let html = await renderTemplate("students.html", {
      students,
      houses: HOUSES,
      order,
    });
    response.writeHead(200, { "Content-Type": "text/html" }).end(html);
  }
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
async function studentDelete(request, response) {
  let formData = await parseFormData(request);
  let studentId = formData.get("id");

  if (studentId) {
    await db.run("DELETE FROM students WHERE id = ?", studentId);
  }

  redirect(request, response, "/students");
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
async function studentChange(request, response, params) {
  let studentId = params.id;
  let student = studentId
    ? await db.get("SELECT name, house FROM students WHERE id = ?", studentId)
    : null;

  if (!student) {
    response
      .writeHead(404, { "Content-Type": "text/html" })
      .end("<h1>No student found</h1>\n");
    return;
  }

  let context = {
    student,
    houses: HOUSES,
  };

  if (request.method == "POST") {
    let formData = await parseFormData(request);
    let studentName = formData.get("name");
    let studentHouse = formData.get("house");

    let studentNameIsValid = studentName.length > 0;
    let studentHouseIsValid = HOUSES.includes(studentHouse);

    if (studentNameIsValid && studentHouseIsValid) {
      try {
        await db.run(
          "UPDATE students SET name = ?, house = ? WHERE id = ?",
          studentName,
          studentHouse,
          studentId
        );
      } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          let html = await renderTemplate("student-edit.html", {
            ...context,
            errors: {
              unique: "Student name and house are not unique",
            },
          });
          response.writeHead(400, { "Content-Type": "text/html" }).end(html);
          return;
        }
      }
      redirect(request, response, "/students");
    } else {
      let html = await renderTemplate("student-edit.html", {
        ...context,
        errors: {
          name: studentNameIsValid ? undefined : "Name should not be empty",
          house: studentHouseIsValid ? undefined : "Invalid house",
        },
      });
      response.writeHead(400, { "Content-Type": "text/html" }).end(html);
    }
  } else {
    let html = await renderTemplate("student-edit.html", context);
    response.writeHead(200, { "Content-Type": "text/html" }).end(html);
  }
}

async function studentsAPISearch(request, response) {
  var parsedURL = url.parse(request.url);
  let searchParams = new URLSearchParams(parsedURL.query);
  let search = searchParams.get("search");

  let students = await db.all(
    "SELECT name, house FROM students WHERE name LIKE ?",
    `%${search}%`
  );

  json(response, students);
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
async function studentsSearch(request, response) {
  let html = await renderTemplate("students-search.html");
  response.writeHead(200, { "Content-Type": "text/html" });
  response.end(html);
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
async function studentsDownload(request, response) {
  const FIELD_NAMES = ["id", "name", "house"];
  let students = await db.all(`SELECT ${FIELD_NAMES.join(", ")} FROM students`);

  // prettier-ignore
  var csvStr = students
    .map(function (student) {
      return FIELD_NAMES
        .map(function (fieldName) { return student[fieldName]; })
        .join(",");
    })
    .join("\n");

  response
    .writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment;filename=students.csv",
    })
    .end(`${FIELD_NAMES.join(",")}\n${csvStr}\n`);
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} context
 * @returns {Promise<string>}
 */
async function renderTemplate(name, context) {
  let templateStr = await fs.readFile(path.join("templates", name), "utf-8");
  let template = handlebars.compile(templateStr);
  let htmlStr = template(context);
  return htmlStr;
}

server.listen(PORT, HOSTNAME, function () {
  console.log(`🚀 Server running at http://${HOSTNAME}:${PORT}`);
});
