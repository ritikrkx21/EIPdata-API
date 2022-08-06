const express  = require('express');
const cors  = require('cors');

const fs = require('fs');
var process = require("process");

const matter = require('gray-matter');
const fetch = require('node-fetch');
const path = require('path');
const { isFunction } = require('util');
const e = require('express');
const dirPath = path.join(__dirname,'EIPs');

const app = express();
app.use(cors());

console.log(dirPath);
const dir = dirPath;


let countMeta = 0 ;
let countInformational = 0 ;
let countStandardsTrack = 0;
let countERC = 0;
let countCore = 0;
let countNetworking = 0 ; 
let countInterface = 0 ;

let statusEIP = ['Final','Draft','Review','Last Call','Stagnant','Withdrawn','Living'];

let categoryEIP = ['Networking','ERC','Core','Interface'];

let typeEIP = ['Standards Track', 'Meta', 'Informational' ];


let statusPage = {};
for(let varStatus of statusEIP)
{
    let temp={};

    for(let varType of typeEIP)
    {
        if(varType == 'Standards Track' )
        {
            let temp2 = {};

            for(let varCategory of categoryEIP)
            {
                temp2[varCategory] =0;
            }
            temp[varType] = temp2;
        }
        else if(varType == 'Meta' )
        {
            temp[varType] = 0;
        }
        else if(varType == 'Informational')
        {
            temp[varType] = 0;
        }
        
    }

    statusPage[varStatus] = temp;
}

let typeChart = {};
for(let varType of typeEIP)
{
    let temp = {};
    let flag = 0;
    if(varType == 'Standards Track')
    {

        for(let varCategory of categoryEIP)
        {
          temp[varCategory] = 0 ;
        }

        flag = 1;

    }
    
    if(flag)
    typeChart[varType] = temp;
    else
    typeChart[varType]  = 0 ;
}

let chart2 = {};

for(let varStatus of statusEIP)
{
    let temp = {};

    for(let varCategory of categoryEIP)
    {
        temp[varCategory] = 0;
    }

    chart2[varStatus] = temp;

}


function chartForHomeAndMonthly(type, category, status)
{
    for(let statusVar in chart2)
    {
        if(statusVar == status && type == 'Standards Track')
        {
            for(let categoryVar in chart2[statusVar])
            {
               if(categoryVar == category)
               {
                chart2[statusVar][categoryVar] ++;
                break;
               }
            }
            break;
        }
    }
}

function typeChartData(type,category,status)
{
   let ar1 = Object.keys(typeChart);
         
   for( let childObj of ar1 )
   {
        if( childObj == type  && type == 'Standards Track' )
        {    
         let ar2 = Object.keys( typeChart[ childObj ] );

            for( let key of ar2 )
            {
                if( category == key )
                {
                  typeChart[ childObj ][ key ] ++;
                  break;
                }
            }
         break;
        }
        else if(type == 'Meta' && type == childObj){
              
            typeChart[childObj] ++;
            break;

        }
        else if(type == 'Informational' && type == childObj)
        {
             typeChart[childObj] ++;
             break;
        }
    }

}


function statusPageData(type,category,status)
{
   for(let varStatus in statusPage)
   {
      if(varStatus == status && type == 'Standards Track')
      {
        for(let varCategory in statusPage[varStatus][type])
        {
            if(category == varCategory)
            {
                statusPage[varStatus][type][varCategory] ++;
                break;
            }
        }
        break; 
      }
      else if(varStatus == status && type == 'Meta')
      {
        statusPage[varStatus][type] ++;
        break;
      }
      else if(varStatus == status && type == 'Informational')
      {
        statusPage[varStatus][type] ++;
        break; 
      }
   }
}


let homeobj = {};
function homePageData(type,category,status)
{
    if(type == 'Meta')
    countMeta++;
    else if(type == 'Informational')
    {countInformational++;}
    else if(type == 'Standards Track')
    countStandardsTrack++;

    if(category == 'ERC')
    countERC++;
    else if(category == 'Core')
    countCore++;
    else if(category == 'Interface')
    countInterface++;
    else if(category == 'Networking')
    countNetworking++;


    homeobj["Networking"]=countNetworking;
    homeobj["ERC"]=countERC;
    homeobj["Interface"]=countInterface;
    homeobj["Core"]=countCore; 
    homeobj["Meta"]=countMeta;
    homeobj["Standards Track"]=countStandardsTrack;
    homeobj["Informational"]=countInformational;
}

 function readFiles(dir){
  
 fs.readdir(dir, function(err,files){
    if(err)
    {
        console.error("Could not list the file ", err);
        process.exit(1);
    }
   
    console.log(files.length);

    files.forEach(function(file){

         fs.readFile( `${dir}/${file}` ,'utf8', function(err, content){
            
            if(err)
            {
                console.error(err);
                process.exit(1);
            }
            
            let eipfile = matter(content);
            let data = eipfile.data;
            let type = eipfile.data.type;
            let status = eipfile.data.status;
            let category = eipfile.data.category;

            homePageData(type, category, status);
            chartForHomeAndMonthly(type, category, status);
            typeChartData(type, category, status);
            statusPageData(type, category, status);

         });
    });

    // console.log("I am done fecthing !");

 });

//  console.log("Every thing loooks good !");

}


readFiles(dir);


app.get('/overallData', async(req,res)=>{ 
    res.send(homeobj);
})

app.get('/chartData-Home-Monthly', async(req,res)=>{
    res.send(chart2);
})

app.get('/typePage', async(req,res)=>{
    res.send(typeChart);
})

app.get('/statusPage', async(req,res) =>{
    res.send(statusPage);
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3821;
}

app.listen(port,()=>{
    console.log('Server is running at port 3821');
})
  
