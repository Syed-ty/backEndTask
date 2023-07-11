const {WebSiteScrap}  = require ('../model/websitescrap_model')
const puppeteer = require('puppeteer');
const getAllUser = async (req, res, next) => {
    try {
        const userData = await WebSiteScrap.find({});
        res.status(200).json({
            error: false,
            message: "all user list",
            userData
        })
    } catch (err) {
        next(err)
    }
}



const getUserById =  async (req,res,next)=>{
    try {
        let user = await WebSiteScrap.findOne({_id:req.params.id})
        res.status(200).json({error:false,message:'User fetched successfully',response:user})
    } catch (error) {
        next(err)
    }
}

const getUserByEmail =  async (req,res,next)=>{
    try {
        let user = await WebSiteScrap.findOne({email:req.params.email})
        res.status(200).json({
            error:false,
            message:'User fetched successfully based on Email',
            response:user})
    } catch (error) {
        next(err)
    }
}

// var puppeteer = require('puppeteer');

const postApi = async (req, res, next) => {
    try {
        const {
            searchUrl
        } = req.body;
    data(req.body.searchUrl)
  .then(async websiteDetails => {
    console.log('daat', websiteDetails);
    const fontDetailsArray = websiteDetails.fontDetails;
    function removeDuplicates(fontDetailsArray) {
        const newArray = [];
        const uniqueObject = {};
        for (let i in fontDetailsArray) {
            objTitle = fontDetailsArray[i]['fontFamily'];
            uniqueObject[objTitle] = fontDetailsArray[i];
        }
        for (i in uniqueObject) {
            newArray.push(uniqueObject[i]);
        }
       return newArray
    }
    const result = removeDuplicates(fontDetailsArray);
    const finalArray = [];
     result.forEach(element=>{
        const trimmedElement = element.fontFamily.replace(/"/g, '');
        finalArray.push(trimmedElement);
     })
     console.log(finalArray,'finalarray')
      const createData = await WebSiteScrap.create({
        brandWebsite:websiteDetails.websiteURL,
        brandName:websiteDetails.websiteName,
        logoofWebsite:websiteDetails.logoSrc,
        themesOfLogo:'#525cb',
        brandDescription:websiteDetails.description,
        keywords:websiteDetails.keywords,
        typography:finalArray
        });
        if (createData) {
            res.status(200).json({
                error: false,
                message: "Website added Successfully to DataBase",
                response: createData
            })

        } else {
            res.status(200).json({
                error: true,
                message: "Some thing went wrong",
            })
        }
  })
  .catch(error => {
    console.error('Error:', error);
  });  
    } catch (err) {
        next(err)
    }
};


async function data (url) {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    // Create a new page
    const page = await browser.newPage();
    const websiteUrl = 'https://www.firstcry.com';
    // Navigate to a URL
    await page.goto(websiteUrl);
  //description
      const description = await page.$eval('meta[name="description"]', (element) => element.content);
    //   console.log('Website Description:', description);
  //Keywords
      const keywords = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="keywords"]');
        return metaTag ? metaTag.getAttribute('content') : ''
      });
    //   console.log('OutsideKeywords:', keywords);
     //logoSrc
          const logoElement = await page.$('img'); // Assuming the logo is an <img> element
          const logoSrc = await logoElement.evaluate((img) => img.src);
        //   console.log('Logo URL:', logoSrc);
  //fontDetails
    const fontDetails = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      // Create a Set to store unique font details
      const fontSet = new Set();
  
      for (const element of elements) {
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.getPropertyValue('font-family');
        const fontSize = computedStyle.getPropertyValue('font-size');
        const fontWeight = computedStyle.getPropertyValue('font-weight');
        const fontStyle = computedStyle.getPropertyValue('font-style');

        const fontDetail = {
          fontFamily,
          fontSize,
          fontWeight,
          fontStyle
        };
  
        fontSet.add(JSON.stringify(fontDetail));
      }
  
      // Convert Set back to an array
      const fontArray = Array.from(fontSet);
  
      // Convert JSON strings back to objects
      const fontDetails = fontArray.map(font => JSON.parse(font));
  
      return fontDetails;
    });
    
  //websiteDetails
      const websiteName = await page.evaluate(() => {
        return document.querySelector('title').textContent;
      });
      // Get website URL
      const websiteURL = page.url();
    //   console.log('hereeWebsite Name:', websiteName);
    //   console.log('hereWebsite URL:', websiteURL);
      let obj={
        websiteName:websiteName,
        websiteURL:websiteURL,
        fontDetails:fontDetails,
        logoSrc:logoSrc,
        keywords :keywords,
        description:description
      }
    return obj
  //   await browser.close();
  }


const deleteUser = async(req,res,next)=>{
    try{
      const deleteUserData = await WebSiteScrap.deleteOne({_id:req.params.id})
      if(deleteUserData){
        res.status(200).json({
            error:false,
            message:'User Deleted Successfully',
            response: deleteUserData
        })
      }else{
        res.status(400).json({
            error:true,
            message:'Something Went Wrong'
        })
      }
    }catch(error){
      next(error)
    }
  }

  const UserPagination = async (req, res, next) => {
    try {
        const {
            currentPage,
            pageSize
        } = req.query;

        const skip = parseInt(pageSize) * (parseInt(currentPage) - 1);
        const limit = parseInt(pageSize);
        let mixed = await WebSiteScrap.find().limit(limit).skip(skip).exec();
        let totalmixed = await WebSiteScrap.find();
        let totalLength = totalmixed.length;
        if ((totalmixed, mixed)) {
            res
                .status(200)
                .json({
                    error: false,
                    message: "WebSiteScrap data Fetched Successfully",
                    response: mixed,
                    totalmixed: totalLength,
                });
        } else {
            res.status(404).json({
                error: true,
                message: "No WebSiteScrap Data Found",
            });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUser,
    getUserById,
    postApi,
    deleteUser,
    getUserByEmail,
    UserPagination
}