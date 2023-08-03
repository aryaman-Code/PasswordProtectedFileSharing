require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const app=express()
const multer=require('multer')
const File=require("./models/File")

const upload=multer({dest:"uploads"})
mongoose.connect(process.env.DATABASE_URL)

app.set("view engine","ejs")

app.use(express.urlencoded({extended:true}))
app.get('/',(req,res)=>{
    res.render("index")
})

app.post("/upload" ,upload.single("file"),async(req,res)=>{
 /* we use req.file because multer takes care of file in index.ejs
   but express takes care of password so we use req.body 
 */
  const fileData={
        path:req.file.path,
        originalName:req.file.originalname
    }
    if(req.body.password!=null&&req.body.password!=""){
        fileData.password=await bcrypt.hash(req.body.password,10)
    }
    const file=await File.create(fileData)
 /*  2 console.log(file)
    res.send(file.originalName)*/
  res.render("index",{fileLink:`${req.headers.origin}/file/${file.id}`})
   //1 res.send("hi")
})

/*app.get("/file/:id",handleDownload)
app.post("/file/:id",handleDownload)*/
app.route("/file/:id").get(handleDownload).post(handleDownload)


     // res.send(req.params.id)


async function handleDownload(req,res){
    const file=await File.findById(req.params.id)
    if(file.password!=null)
    {
       if(req.body.password==null){
           res.render("password")
           return
       }
     if(!(await bcrypt.compare(req.body.password,file.password)))
       {
           res.render("password",{error:true})
           return
       }
    }
    file.downloadCount++
    console.log(file.downloadCount)
    await file.save()
    res.download(file.path,file.originalName) 
}

app.listen(process.env.PORT)