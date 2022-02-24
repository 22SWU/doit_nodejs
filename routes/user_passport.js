// 라우팅 관련 함수를 분리
module.exports = function(router, passport){
    console.log('user_passport 호출됨.');
    
    // 홈화면
    router.route('/').get(function(req, res){
        console.log('/ 패스 요청됨.');
        res.render('index.ejs');
    });
    
    // 로그인 화면
    router.route('/login').get(function(req, res){
        console.log('/login 패스 요청됨.');
        res.render('login.ejs');
    });
    
    // 회원가입 화면
    router.route('/signup').get(function(req, res){
        console.log('/signup 패스 요청됨.');
        res.render('signup.ejs');
    });
    
    // 프로필 화면
    router.route('/profile').get(function(req, res){
        console.log('/profile 패스 요청됨.');
        console.log('req.user 객체의 값');
        console.dir(req.user);

        // 인증이 안 된 경우
        if(!req.user){
            console.log('사용자 인증이 안 된 상태임.');
            res.redirect('/');
            return;
        }else{
            console.log('사용자 인증된 상태임.');
            console.log('/profile 패스 요청됨.');
            console.dir(req.user);
            
            if(Array.isArray(req.user)){
                res.render('profile.ejs', {user: req.user[0]._doc});
            }else{
                res.render('profile.ejs', {user: req.user});
            }
        }
    });
    
    // 로그아웃
    router.route('/logout', function(req, res){
        console.log('/logout 패스 요청됨.');
        // 로그아웃 실행
        req.logout();
        // 홈 화면으로 이동
        res.redirect('/');
    });
    
    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));
}