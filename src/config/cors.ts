import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function(origin, callback) {
    const whiteList = [process.env.FRONTEND_URL];
    console.log(whiteList);
    // process.arg[2]: Verifica si el tercer argumento pasado al ejecutar un script de Node.js es la cadena "--api" (Puede ser otra)
    if(process.argv[2] === '--api') {
      whiteList.push(undefined);
    }

    // Comprobar si el origin es uno de las rutas del whiteList
    if(whiteList.includes(origin)) {
      callback(null, true);
    }else {
      console.log(origin);
      callback(new Error('Error de CORS'));
    }
  }
}