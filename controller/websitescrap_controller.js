const {WebSiteScrap}  = require ('../model/websitescrap_model')
const puppeteer = require('puppeteer');
const getColors = require('get-image-colors')



const postApi = async (req, res, next) => {
    try {
        const {
            searchUrl
        } = req.body;
    data(req.body.searchUrl)
  .then(async websiteDetails => {
    // console.log(websiteDetails,'web');
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
      const createData = await WebSiteScrap.create({
        brandWebsite:websiteDetails.websiteURL,
        brandName:websiteDetails.websiteName,
        logoofWebsite:websiteDetails.logoSrc,
        themesOfLogo:websiteDetails.extractlogoColor,
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
    const websiteUrl = url;
    // Navigate to a URL
    await page.goto(websiteUrl, {timeout: 0});
  //description

//   const descriptionElement =await page.$('meta[name="description"]');
//  let description
//   if (descriptionElement) {
//      description = await page.$eval('meta[name="description"]', (element) =>{
//         element?.content
//       });
//   } else {
//      description = 'No Data Found'
//   }
const description = await page.$eval('meta[name="description"]', (element) => element.content);

      
  //Keywords
  
      const keywords = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="keywords"]');
        console.log(metaTag,'meta')
        return metaTag ? metaTag.getAttribute('content') : ''
      });
     //logoSrc
          const logoElement = await page.$('img'); // Assuming the logo is an <img> element
          const logoSrc = await logoElement.evaluate((img) => img.src);
// Create a Vibrant object with the logo image
// let colorResponse 
//  await fetchcolors(logoSrc).then((res)=>{
// console.log(res,"responsewert");
// colorResponse = res
// })

// by using get-image-colors libraray

const colors = await getColors(logoSrc);

const colorValues = colors.map(color => color.hex());

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
      let obj={
        websiteName:websiteName,
        websiteURL:websiteURL,
        fontDetails:fontDetails,
        logoSrc:logoSrc,
        keywords :keywords,
        description:description,
        extractlogoColor:colorValues
      }
    return obj
  //   await browser.close();
  }

 
  const updateApi = async (req, res, next) => {
    try {
      const {
         selectedfile
         } =
        req.body;
        const colors = await getColors(req.body.selectedfile);
        const colorValues = colors.map(color => color.hex());
        const updateData = await  WebSiteScrap.findOneAndUpdate({
        _id :req.params.id
       },{
       $set: {
        logoofWebsite:selectedfile,
        themesOfLogo:colorValues,
       }
      },
       {
       new: true
      })
         if (updateData) {
        res.status(200).json({
          error: false,
          message: "Updated logo and themes colors are Successfully",
          response: updateData,
        });
      } else {
        res.status(404).json({
          error: true,
          message: "No data found",
        });
      }
    } catch (err) {
      next(err.message);
    }
  };



module.exports = {
    postApi,
    updateApi,
    
}