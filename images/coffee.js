server.post("/add", function (req, res) {
    //for upload file and fields
    // var form = formidable({maxFileSize:300*1024});
    var form = new formidable.IncomingForm();
    form.maxFileSize = 200 * 1024; //檔案最大200Kb
    form.parse(req, function (err, fields, files) {
        if (err) {
            //show error message and redirect to next
            res.render("error", { error: err.message, next: "javascript:history.back()" });
        } else {
            var newGame = fields;
            newGame.players = parseInt(newGame.players);
            var ext = files.poster.originalFilename.split('.')[1];
            newGame.poster = fields.id + "." + ext;
            var posterPath = "upload/files/" + newGame.poster;

            //check uploaded image's size
            var input = fs.createReadStream(files.poster.filepath);
            probe(input).then(result => {
                //console.log(result);
                input.destroy();
                if (result.width == 800 && result.height == 400) {
                    //update insert a game record
                    Games.update({ id: newGame.id }, newGame, { upsert: true }).then(doc => {
                        //remove file if it exits
                        if (fs.existsSync(posterPath)) {
                            fs.unlinkSync(posterPath);
                        }
                         fs.renameSync(files.poster.filepath, posterPath);                                                                                         
                        //Success
                        res.render("success", {msg:"Upload Succeful! Next, return to upload form.", next:"/game.html"});

                    }).catch(err => {
                        //show error message and redirect to next
                        res.render("error", { error: err.message, next: "javascript:history.back()" })
                    })
                } else {
                    res.render("error", { error: "Upload failed: Image Sizes are not 800x400!", next: "javascript:history.back()" });
                }
            });
        }
    });
});
