const multer = require('multer');
const fs = require('fs');
const path = require('path');

export const Uploader = (location:string) => {
    const storage = multer.diskStorage({
        destination: (req:any, file:any, cb:any) => {
            const dest = path.join(__dirname, `../uploads/${location}`);
            fs.access(dest, fs.constants.F_OK, (err:any) => {
                if (err) {
                    fs.mkdir(dest, { recursive: true }, (err:any) => {
                        if (err) {
                            console.error('Failed to create directory', err);
                            cb(err);
                        } else {
                            cb(null, dest);
                        }
                    });
                } else {
                    cb(null, dest);
                }
            });
        },
        filename: (req:any, file:any, cb:any) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    });

    return multer({ storage: storage });
}
