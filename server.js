const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const http = require('http');
const cookieParser = require('cookie-parser');
//const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const socketIO = require('socket.io');
const { Users } = require('./helpers/UsersClass');
const { Global } = require('./helpers/Global');
const compression = require('compression');
const helmet = require('helmet');

const container = require('./container');

container.resolve(function (users, _, admin, home, group, results, privatechat, profile, interests, news) {
  //Load env variables
  dotenv.config({ path: './config/config.env' });
  //configure mongoose module connection
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
  //Creat app server
  const app = setupExpress();
  //setup express function
  function setupExpress() {
    //Create Express Server
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log('Listening on port 3000');
    });
    //Configre Exprees 
    configureExpress(app);
    //Scoket IO
    require('./socket/groupchat')(io, Users);
    require('./socket/friend')(io);
    require('./socket/globalroom')(io, Global, _);
    require('./socket/privatemessage')(io);
    //Setup router 
    //Setup router
    const router = require('express-promise-router')();
    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);
    results.SetRouting(router);
    privatechat.SetRouting(router);
    profile.SetRouting(router);
    interests.SetRouting(router);
    news.SetRouting(router);

    app.use(router);

    app.use(function (req, res) {
      res.render('404');
    });
  };
  //Configure express server
  function configureExpress(app) {
    app.use(compression());
    app.use(helmet());
    //
    require('./passport/passport-local');
    require('./passport/passport-facebook');
    require('./passport/passport-google');
    //
    app.use(express.static('public'));
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    //session and validation middleware modules
    //app.use(validator());
    app.use(session({
      secret: 'thisissecretkey',
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    //flash middleware module
    app.use(flash());
    //passport middleware module
    app.use(passport.initialize());
    app.use(passport.session());
    // to allow use lodash
    app.locals._ = _;
  }
});

