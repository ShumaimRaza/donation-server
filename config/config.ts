import User, {IUser} from "../models/User";
import bcrypt from 'bcryptjs';

export const configUser = () => {
    User.findOne({username: 'manager'}).then((user: IUser | null) => {
        bcrypt.hash('password', 10).then((hashedPassword: string) => {
            if(!user) {
                const newUser = new User({
                    fullname: "Manager",
                    username: 'manager',
                    email: 'manager@mjmarry.com',
                    password: hashedPassword,
                    role: 'Manager',
                    profile: null
                })
                newUser.save();
                console.log('Manager created');
            }
        })
    })
}