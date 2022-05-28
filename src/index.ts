import app from './app';
import * as http from 'http';
import * as fs from 'fs';
const PORT = process.env.PORT;

// const options = {
//     key: fs.readFileSync(__dirname+'/config/cert.key'),
//     cert: fs.readFileSync(__dirname+'/config/cert.crt')
// };


http.createServer(app).listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})