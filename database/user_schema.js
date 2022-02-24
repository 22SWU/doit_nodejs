var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose){
    
        // 이미 만들어 놓은 users 컬렉션을 위해 스키마를 정의
        var UserSchema = mongoose.Schema({
            email : {type: String, 'default':''},
            hashed_password:{type: String, required: true, 'default':''},
            name: {type: String, index: 'hashed', 'default':''},
            salt:{type: String,required: true},
            created_at: {type: Date, index: {unique: false}, 'default':Date.now},
            updated_at: {type: Date, index: {unique: false}, 'default':Date.now}
        });
    
        
        UserSchema
            .virtual('password')
            .set(function(password){
                this._password = password;
                this.salt = this.makeSalt();
                this.hashed_password = this.encryptPassword(password);
            
                console.log('virtual password 호출됨 : ' + this.hashed_password);
        })
        .get(function() {return this._password});
    
        UserSchema.method('encryptPassword', function(plainText, inSalt){
            if(inSalt){
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            }else{
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
            }
        });
    
    UserSchema.method('makeSalt', function(){
        console.log('makeSalt 만들어지는 중');
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });
    
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
        console.log('어쩌구 저쩌구');
            if(inSalt){
                console.log('authenticate 호출');
                return this.encryptPassword(plainText, inSalt) === hashed_password;
            }else{
                console.log('authenticate 호출');
                return this.encryptPassword(plainText) === this.hashed_password;
            }
    });
    
    UserSchema.path('name').validate(function(name){
        return name.length;
    }, 'name 칼럼의 값이 없습니다.');
    
    UserSchema.path('email').validate(function(email){
        return email.length;
    }, 'email 칼럼의 값이 없습니다.');
        
    UserSchema.path('hashed_password').validate(function(hashed_password){
        return hashed_password.length;
    }, 'hashed_password 칼럼의 값이 없습니다.');
        
    
    // 메소드를 정의
        
        UserSchema.static('findAll', function(callback){
            return this.find({ }, callback);
        });
    
        UserSchema.static('findByEmail', function(callback){
            return this.find({email : email}, callback);
        });
    
        console.log('UserSchema 정의함.');
        
        UserModel = mongoose.model("user4", UserSchema);
        console.log('UserModel 정의함.');
    
    return UserSchema;
};

module.exports = Schema;