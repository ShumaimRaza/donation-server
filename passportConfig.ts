import User, { IUser } from './models/User';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

export default function initialize(passport: passport.PassportStatic): void {
  passport.use(
    new LocalStrategy({ usernameField: 'identifier' }, (identifier, password, done) => {
      User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      }).then((user: IUser | null) => {
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id })
      .populate('profile')
      .populate('ngo')
      .exec()
      .then((user) => {
        return cb(null, user);
      })
      .catch((err) => {
        if (err) {
          return cb(err, null);
        }
      });
  });
}
