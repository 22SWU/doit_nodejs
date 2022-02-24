var express = require("express");
var http = require("http");
var static = require("serve-static");
var path = require("path");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var expressErrorHandler = require("express-error-handler");
var MongoClient = require("mongodb").MongoClient;

var database;
function connetDB() {
  var databaseUrl = "mongodb://localhost:27017/local";
  MongoClient.connect(databaseUrl, function (err, db) {
    if (err) {
      console.log("데이터베이스 연결 에러");
      return;
    }
    console.log("데이터베이스 연결 성공 : " + databaseUrl);
    database = db.db("local");
  });
}

var app = express();

app.set("port", process.env.PORT || 3000);
app.use("/public", static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

var router = express.Router();

router.route("/process/login").post(function (req, res) {
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  if (database) {
    console.log(paramId);
    authUser(database, paramId, paramPassword, function (err, docs) {
      if (err) {
        res.writeHead(200, {
          "Content-Type": "text/html;charset=utf8",
        });
        console.log(err);
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }
      if (docs) {
        res.writeHead(200, {
          "Content-Type": "text/html;charset=utf8",
        });
        res.write("<h1>사용자 로그인 성공</h1>");
        res.write("<div><p>사용자 : " + docs[0].name + "</p></div>");
        res.write('<br/><br/><a href="/public/login.html">다시 로그인하기</a>');
        res.end();
      } else {
        res.writeHead(200, {
          "Content-Type": "text/html;charset=utf8",
        });
        res.write("<h1>사용자 데이터 조회 에러</h1>");
        res.end();
      }
    });
  } else {
    res.writeHead(200, {
      "Content-Type": "text/html;charset=utf8",
    });
    res.write("<h1>데이터베이스 에러</h1>");
    res.end();
  }
});

app.use("/", router);

var authUser = function (db, id, password, callback) {
  console.log("authUser 호출됨");
  var users = db.collection("users");
  users.find({ id: id, password: password }).toArray(function (err, docs) {
    if (err) {
      callback(err, null);
      return;
    }
    if (docs.length > 0) {
      console.log("일치하는 사용자를 찾음.");
      callback(null, docs);
    } else {
      console.log("일치하는 사용자를 찾지 못함.");
      callback(null, null);
    }
  });
};

// 404 error
var errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// server
var server = http.createServer(app).listen(app.get("port"), function () {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));

  connetDB(); // db연결
});
