const express = require("express");
const agentes = require('./data/agentes.js');
const app = express();
const jwt = require('jsonwebtoken');

app.listen(3000, console.log("SERVER ON!"));

const secretKey = "Mi Llave Ultra Secreta";

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

// 1. Crear una ruta que autentique a un agente basado en sus credenciales y genere un 
// token con sus datos. 
app.get("/SignIn", (req, res) => {
    const { email, password } = req.query;

    const agente = agentes.results.find((u) => u.email == email && u.password == password);

    if (agente) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: agente,
            },
            secretKey);
        // 2. Al autenticar un agente, devolver un HTML que:
        // a. Muestre el email del agente autorizado.
        // b. Guarde un token en SessionStorage con un tiempo de expiración de 2 minutos.
        // c. Disponibiliza un hiperenlace para redirigir al agente a una ruta restringida. 
        res.send(`
            <a href="/AccesoRestringido?token=${token}"> <p> Ir al Acceso Restringido </p> </a>
            Bienvenido, ${email}.
            <script>
            localStorage.setItem('token', JSON.stringify("${token}"))
            </script>
            `);
    } else {      
        res.send("Usuario no está autorizado - Usuario o contraseña incorrecta");
    }
});

// 3. Crear una ruta restringida que devuelva un mensaje de Bienvenida con el correo del 
// agente autorizado, en caso contrario devolver un estado HTTP que indique que el 
// usuario no está autorizado y un mensaje que menciona la descripción del error.
app.get("/AccesoRestringido", (req, res) => {
    const { token } = req.query;
    
    jwt.verify(token, secretKey, (err, data) => {
        err
            ? res.status(401).send({
                error: "401 Usuario no está autorizado",
                message: err.message,
            })
            : res.send (`Bienvenido, ${data.data.email}`);
    })
});
