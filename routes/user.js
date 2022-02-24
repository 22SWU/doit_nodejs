var database;
var UserSchema;
var UserModel;

var init = function(db, schema, model){
    console.log('init 호출됨.');
    
    database = db;
    UserSchema = schema;
    UserModel = model;
}

// 루트의 로그인 함수
var login = function(req, res){
    console.log('user 모듈 속 라우터 /process/login 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
    //var database = req.app.get('database');
    
    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err) {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                return;}
            
            if(docs) { 
                
                console.dir(docs);
                
                var username = docs[0].name;
                
                var context = {userid:paramId, username:username};
                req.app.render('login_seccess', context, function(err, html){
                    if(err){
                        console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
                        
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 오류 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();
                        
                        return;
                    }
                    console.log('rendered : ' + html);
                    
                    res.end(html);
                });
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 이름 : ' + docs[0].name + '</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.write('<div><p>데이터베이스에 연결하기 못했습니다.</p></div>');
                res.end();
    }
}

var adduser = function(req, res){
    console.log('user 모듈 속 /process/adduser 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);
    
    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            console.log(result);
            if(err) {throw err;}
            
            if(result){
                console.dir(result);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
                var context = {title:'사용자 추가 성공'};
                req.app.render('adduser', context, function(err, html){
                    if(err){
                        console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
                        
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 오류 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();
                        
                        return;
                    }
                    
                    console.log("redered : " + html);
                    res.end(html);
                });
                res.write('<h2>사용자 추가 성공</h2>');
                
            
                res.end();
            } else{
                                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.end();
    }
}

var listuser = function(req, res){
    console.log('user 모듈 속 라우터 /process/listuser 호출됨.');
    
    //var database = req.app.get('database');
    // database.db
    
    if(database){
        UserModel.findAll(function(err, results){
            if(err){
                console.log('사용자 리스트 조회 중 오류 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                var context = {results : results};
                req.app.render('listuser', context, function(err, html){
                    if(err){throw err;}
                    res.end(html);
                });
            }
            
            if(results){
                console.dir(results);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트</h2>');
                res.write('<div><ul>');
                
                for(var i = 0; i<results.length; i++){
                    var curId = results[i].id;
                    var curName = results[i].name;
                res.write('     <li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
                }
                
                
                res.write('</ul></div>');
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.end();
    }
}




// 사용자가 보내온 아이디와 비밀번호 비교하기
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨.');
    
    // 입력된 아이디 값을 가진 내용을 찾기
    UserModel.findById(id, function(err, results){
        
    console.log('아이디 검색.');
        if(err){
    console.log('아이디 결과 실패.');
            callback(err, null);
            return;
        }
        
        console.log('아이디 [%s]로 사용자 검색 결과', id);
        console.dir(results);
        
        if(results.length >0 ){
            console.log('아이디와 일치하는 사용자 찾음.');
            
            var user = new UserModel({id : id});            
            console.log('넘어와지냐' +  results[0]._doc.salt);
            var authenticated = user.authenticate(password, results[0]._doc.salt,
                                                 results[0]._doc.hashed_password);
            
            if(authenticated){
                console.log('비밀번호 일치함.');
                callback(null, results);
            }else{
                console.log('비밀번호 일치하지 않음.');
                callback(null, null);
            }
        }else{
            console.log("아이디와 일치하는 사용자를 찾지 못함");
            callback(null, null);
        }
    });
    
}


// 사용자를 추가하는 함수
var addUser = function(db, id, password, name, callback){
    console.log('addUser 호출됨.');
    
    var user = new UserModel({"id": id, "password":password, "name":name});
    
    user.save(function(err){
        if(err){
            console.log(err);
            callback(err, null);
            
            return;
        }
        
        callback(null, user);
    });  
}


module.exports.init = init;
module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;