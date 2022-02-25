var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var static = require("serve-static");
var errorHandler = require("errorhandler");

var flash = require("connect-flash");
var expressErrorHandler = require("express-error-handler");

var expressSession = require("express-session");

var mongoose = require("mongoose");

var passport = require("passport");
var users = require("./routes/user");
var router_loader = require("./routes/route_loader");

// ===== JSON-RPC 사용 ====== //
var jayson = require("jayson");
// RPC를 사용하는 모듈 로딩하는 역할.
var handler_loader = require("./handler/handler_loader");

// 익스프레스 서버 객체인 익스프레스 객체를 생성
var app = express();

var router = express.Router();

app.set("database", database);

// 기본 포트 설정
app.set("port", process.env.PROT || 3000);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
console.log("뷰 엔진이 ejs로 설정되었습니다.");

var router = express.Router();
router_loader.init(app, router);
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/views", static(path.join(__dirname, "views")));
app.use("/public", static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

var userPassport = require("./routes/user_passport");
userPassport(app, passport);
var config = require("./config");
var configPassport = require("./config/passport");

// app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);
// 패스포트 초기화
app.use(passport.initialize());
// 로그인 세션을 유지
app.use(passport.session());

app.use(flash());
app.use("/", router);

// JSON-RPC 사용 PATH를 정하기
var jsonrpc_api_path = config.jsonrpc_api_path || "/api";
handler_loader.init(jayson, app, jsonrpc_api_path);
console.log(
  "JSON-RPC를 [" + jsonrpc_api_path + "] 패스에서 사용하도록 설정함."
);

// 몽고디비 모듈 사용
var MongoClient = require("mongodb").MongoClient;

var database;

var UserSchema;

var UserModel;

configPassport(app, passport);

function connectDB() {
  // 데이터베이스 연결 정보
  var databaseUrl = "mongodb://localhost:27017/local";

  console.log("데이터베이스 연결을 시도합니다.");
  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on(
    "error",
    console.error.bind(console, "mongoose connection error.")
  );

  // 데이터베이스와 연결이 되었을 때 발생하는 이벤트
  database.on("open", function () {
    console.log("데이터베이스에 연결되었습니다 : " + databaseUrl);

    createUserSchema();
  });

  // 연결이 끊어졌을 때 발생하는 이벤트
  database.on("disconnected", function () {
    console.log("연결이 끊어졌습니다. 5초 후 다시 연결합니다.");
    setInterval(connectDB, 5000);
  });
}

var errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});

http.createServer(app).listen(app.get("port"), function () {
  console.log("서버가 시작되었습니다. 포트 : " + app.get("port"));

  connectDB();
});

function createUserSchema() {
  UserSchema = require("./database/user_schema").createSchema(mongoose);

  UserModel = mongoose.model("users5", UserSchema);

  console.log("UserModel 정의함.");

  // 모듈 파일에서도 데이터베이스가 원활하게 실행될 수 있도록 데이터베이스 객체 전달
  users.init(database, UserSchema, UserModel);
}

var LocalStrategy = require("passport-local").Strategy;

// 사용자가 로그인에 성공했을 때 사용자 정보를 저장 -> 인증에 성공한 경우
passport.serializeUser(function (user, done) {
  console.log("serializeUser() 호출됨.");
  console.dir(user);

  done(null, user);
});

// 사용자 인증 이후 사용자 요청이 있을 때마다 호출 -> 로그인 상태인 경우
passport.deserializeUser(function (user, done) {
  console.log("deserializeUser() 호출됨.");
  console.dir(user);

  done(null, user);
});
