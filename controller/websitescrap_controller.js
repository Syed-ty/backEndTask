const { WebSiteScrap } = require('../model/websitescrap_model')
const puppeteer = require('puppeteer');
const getColors = require('get-image-colors')

function removeDuplicates(fontDetailsArray) {
  const fontsArray = [];
  for (let i in fontDetailsArray) {
    let { fontFamily } = fontDetailsArray[i];
    fontFamily = fontFamily.replace(/"/g, '');
    if (!fontsArray.includes(fontFamily)) {
      fontsArray.push(fontFamily);
    }
  }
  return fontsArray;
}

const postApi = async (req, res) => {
  try {
    const { searchUrl } = req.body;
    const response = await data(searchUrl);
    const { fontDetails, websiteURL, websiteName, logoSrc, extractLogoColor, description, keywords } = response;
    const createData = await WebSiteScrap.create({
      brandWebsite: websiteURL,
      brandName: websiteName,
      logooFWebsite: logoSrc,
      themesOfLogo: extractLogoColor,
      brandDescription: description,
      keywords: keywords,
      typography: removeDuplicates(fontDetails)
    });
    if (createData) {
      res.status(200).json({
        error: false,
        message: "Website added Successfully to DataBase",
        response: createData
      })
    } else {
      res.status(500).json({
        error: true,
        message: "Some thing went wrong",
      })
    }
  } catch (err) {
    console.log(err, 'err')
    res.status(400).json({
      error: true,
      message: "Invalid URL",
    })
  }
};

async function data(url) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  // Create a new page
  const page = await browser.newPage();
  const websiteUrl = url;
  // Navigate to a URL
  await page.goto(websiteUrl, { timeout: 0 });
  //description
  const description = await page.$eval('meta[name="description"]', (element) => element.content);
  //Keywords
  const keywords = await page.evaluate(() => {
    const metaTag = document.querySelector('meta[name="keywords"]');
    return metaTag ? metaTag.getAttribute('content') : ''
  });
  //logoSrc
  const logoElement = await page.$('img'); // Assuming the logo is an <img> element
  const logoSrc = await logoElement.evaluate((img) => img.src);

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
      const { "font-family": fontFamily, "font-size": fontSize, "font-weight": fontWeight, "font-style": fontStyle } = computedStyle;
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
  let obj = {
    websiteName: websiteName,
    websiteURL: websiteURL,
    fontDetails: fontDetails,
    logoSrc: logoSrc,
    keywords: keywords,
    description: description,
    extractLogoColor: colorValues
  }
  return obj
  //   await browser.close();
}


const updateApi = async (req, res, next) => {
  try {
    const {
      selectedFile
    } =
      req.body;
    const colors = await getColors(selectedFile);
    const colorValues = colors.map(color => color.hex());
    const updateData = await WebSiteScrap.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        logooFWebsite: selectedFile,
        themesOfLogo: colorValues,
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