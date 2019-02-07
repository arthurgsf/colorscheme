const http = require('http');
const path = require('path');
const fs = require('fs');

const express = require('express');

const app = express();
const multer = require('multer');
const jimp = require('jimp');
const math = require('mathjs');

const PORT = process.env.PORT || 3000;

app.get("/", app.use(express.static(path.join(__dirname, "./public"))));

const handleError = (err, res)=>{
    res
        .status(500)
        .contentType("text/plain")
        .end("Algo deu errado!");
    console.log(err);
};

const upload = multer({
    dest:"./temp"
});

app.post(
    "/upload",
    upload.single("img"),
    (req, res) => {
        /* caso seja uma imagem jpg ou png */
        let ext = path.extname(req.file.originalname);
        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg'){
            /* analisa as cores da imagem */
            return getColors(req.file.path, colors=>{
                fs.unlink(req.file.path,(err)=> {if (err) throw err});
                res
                    .status(200)
                    .contentType("application/json")
                    .end(JSON.stringify(colors));
            });
        }else{
        /* caso não seja uma imagem jpg ou png */
            fs.unlink(req.file.path, (err)=>{if (err) throw err});
            res
                .status(400)
                .contentType("application/json")
                .end("{err:'esta imagem não é JPG ou PNG'}");
        }
    }
);


function getColors(path, callback){
    /* lê a img temporária */
    jimp.read(path, (err, img)=>{
        if (err) return handleError(err);
        /* aplica o blur */
        let colors = {'low':[{'0,0,0':0},{'0,0,0':0},{'0,0,0':0},{'0,0,0':0},{'0,0,0':0}], 'high':[{'0,0,0':0},{'0,0,0':0},{'0,0,0':0},{'0,0,0':0},{'0,0,0':0}]};

        let center = [img.bitmap.width/2|0, img.bitmap.height/2|0];
        let offsetx = img.bitmap.width/4|0;
        let offsety = img.bitmap.height/4|0;
        /* primeiro quadrante centro topo*/
        img.scan(center[0] - (offsetx/2|0) , 0, offsetx , offsety, (x, y, idx) => {
            let pixel = [img.bitmap.data[idx], img.bitmap.data[idx+1],img.bitmap.data[idx+2]];
            if(math.std(pixel) > 50){
                if (pixel in colors['high']){
                    colors['high'][0][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['high'][0][pixel] = 1
                }
            }else{
                if (pixel in colors['low']){
                    colors['low'][0][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['low'][0][pixel] = 1
                }
            }
        });

        /* segundo quadrante esquerda centro */
        img.scan(0, center[1] - (offsety/2|0), offsetx , offsety, (x, y, idx) => {
            let pixel = [img.bitmap.data[idx], img.bitmap.data[idx+1],img.bitmap.data[idx+2]];
            if(math.std(pixel) > 50){
                if (pixel in colors['high']){
                    colors['high'][1][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['high'][1][pixel] = 1
                }
            }else{
                if (pixel in colors['low']){
                    colors['low'][1][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['low'][1][pixel] = 1
                }
            }
        });

        /* terceiro quadrante direita centro */
        img.scan(img.bitmap.width - offsetx, center[1] - (offsety/2|0), offsetx, offsety, (x, y, idx) => {
            let pixel = [img.bitmap.data[idx], img.bitmap.data[idx+1],img.bitmap.data[idx+2]];
            if(math.std(pixel) > 50){
                if (pixel in colors['high']){
                    colors['high'][2][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['high'][2][pixel] = 1
                }
            }else{
                if (pixel in colors['low']){
                    colors['low'][2][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['low'][2][pixel] = 1
                }
            }
        });

        /* quarto quadrante centro base */
        img.scan(center[0] - (offsetx/2|0), img.bitmap.height - offsety, offsetx, offsety, (x, y, idx) => {
            let pixel = [img.bitmap.data[idx], img.bitmap.data[idx+1],img.bitmap.data[idx+2]];
            if(math.std(pixel) > 50){
                if (pixel in colors['high']){
                    colors['high'][3][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['high'][3][pixel] = 1
                }
            }else{
                if (pixel in colors['low']){
                    colors['low'][3][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['low'][3][pixel] = 1
                }
            }
        });

        /* quinto quadrante centro centro */
        img.scan(center[0] - (offsetx/2|0), center[1] - (offsety/2|0), offsetx, offsety, (x, y, idx) => {
            let pixel = [img.bitmap.data[idx], img.bitmap.data[idx+1],img.bitmap.data[idx+2]];
            if(math.std(pixel) > 50){
                if (pixel in colors['high']){
                    colors['high'][4][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['high'][4][pixel] = 1
                }
            }else{
                if (pixel in colors['low']){
                    colors['low'][4][pixel] += 1 //conta quantos pixels desse existem
                }else{
                    colors['low'][4][pixel] = 1
                }
            }
        });
        
        colors.low[0] = Object.keys((colors.low[0])).reduce((a, b) => colors.low[0][a] > colors.low[0][b] ? a:b);
        colors.high[0] = Object.keys((colors.high[0])).reduce((a, b) => colors.high[0][a] > colors.high[0][b] ? a:b);

        colors.low[1] = Object.keys((colors.low[1])).reduce((a, b) => colors.low[1][a] > colors.low[1][b] ? a:b);
        colors.high[1] = Object.keys((colors.high[1])).reduce((a, b) => colors.high[1][a] > colors.high[1][b] ? a:b);

        colors.low[2] = Object.keys((colors.low[2])).reduce((a, b) => colors.low[2][a] > colors.low[2][b] ? a:b);
        colors.high[2] = Object.keys((colors.high[2])).reduce((a, b) => colors.high[2][a] > colors.high[2][b] ? a:b);

        colors.low[3] = Object.keys((colors.low[3])).reduce((a, b) => colors.low[3][a] > colors.low[3][b] ? a:b);
        colors.high[3] = Object.keys((colors.high[3])).reduce((a, b) => colors.high[3][a] > colors.high[3][b] ? a:b);

        colors.low[4] = Object.keys((colors.low[4])).reduce((a, b) => colors.low[4][a] > colors.low[4][b] ? a:b);
        colors.high[4] = Object.keys((colors.high[4])).reduce((a, b) => colors.high[4][a] > colors.high[4][b] ? a:b);

        return callback(colors);

    });
}

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
});