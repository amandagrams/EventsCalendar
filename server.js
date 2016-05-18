// ----------- ÍNICIO CONF SERV -----------//
/*
* Dependências node.js
* npm install express
* npm install mongoskin
* npm install body-parser
*/

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

//conexão com mongoDB

var db = require('mongoskin').db("mongodb://localhost:27017/testdb", { w: 0});
    db.bind('event');

//Criar aplicação expressa, usando a pasta publica
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

//Necessário para requisições de POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// ----------- FIM CONF SERV -----------//
 app.get('/data', function(req, res){
    db.event.find().toArray(function(err, data){
        //Setar id da propriedade para todos os registros
        for (var i = 0; i < data.length; i++)
            data[i].id = data[i]._id;

        //resposta de saída
        res.send(data);
	  });
});


app.post('/data', function(req, res){
    var data = req.body;

    //get tipo da operação
    var mode = data["!nativeeditor_status"];
    //trazer id do registro
    var sid = data.id;
    var tid = sid;

    //remove properties which we do not want to save in DB
    delete data.id;
    delete data.gr_id;
    delete data["!nativeeditor_status"];


    //remover propriedades que não deseja salvar no DB
    function update_response(err, result){
        if (err)
            mode = "error";
        else if (mode == "inserted")
            tid = data._id;

        res.setHeader("Content-Type","text/xml");
        res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
    }

    //executar db operação
    if (mode == "updated")
        db.event.updateById( sid, data, update_response);
    else if (mode == "inserted")
        db.event.insert(data, update_response);
    else if (mode == "deleted")
        db.event.removeById( sid, update_response);
    else
        res.send("Ação não suportada");
});

app.listen(3000);