import colors from "colors";
import server from "./server";

// Instalar la dependencia colors: npm i colors

// process.env.<nombre>: Forma de acceder a las variables de entorno
const port = process.env.PORT || 4000;

// listen: Inicia el servidor para que escuche en el puerto especificado, como segundo argumento acepta un callback
server.listen(port, () => {
  console.log(colors.cyan.bold(`REST API funcionando en el puerto ${port}`));
})