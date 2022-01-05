const { PDFDocument, PageSizes, StandardFonts, rgb } = require("pdf-lib")
const fs = require("fs")
const fetch = require("node-fetch")

const getMonth = () => {
    monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = new Date().getMonth()
    return monthArr[month]
}

const arr = [
    {
        key: "Document ID",
        value: "7687ad8fu29j2ij3992333"
    },
    {
        key: "Document Name",
        value: "Naman Singh Resume"
    },
    {
        key: "Sent By",
        value: "Naman Singh"
    },
    {
        key: "Sent On",
        value: "Aug 1, 2021 23:50 IST"
    },
    {
        key: "Completed On",
        value: "Aug 2, 2021 01:50 IST"
    },
    {
        key: "Total Signers",
        value: "5"
    },
    {
        key: "Total Viewers",
        value: "3"
    }
]

const createAuditTrailPdf = async () => {
    const pdfDocument = await PDFDocument.create()
    const pageHeight = PageSizes.A4[1]
    const pageWidth = PageSizes.A4[0]

    //add a page to 
    const page = pdfDocument.addPage(PageSizes.A4)

    //add logo
    const logoImageUrl = "https://digidocs-prod-bucket.s3.ap-south-1.amazonaws.com/main-logo.png"
    const logoImageBytes = await fetch(logoImageUrl).then(res => res.arrayBuffer())
    const embedLogo = await pdfDocument.embedPng(logoImageBytes)
    page.drawImage(embedLogo, {
        x: 40,
        y: pageHeight - 70,
        width: 100,
        height: 32,
    })

    const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold)
    //add date created
    const date = new Date()
    const dateText = `${getMonth()} ${date.getDate()}, ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} IST`
    const dateFontWidth = regularFont.widthOfTextAtSize(dateText, 13)
    page.drawText(dateText, {
        x: pageWidth - (dateFontWidth + 40),
        y: pageHeight - 60,
        size: 13,
        font: regularFont,
        color: rgb(0, 0, 0),
    })

    // add heading of pdf
    const text = "Certificate of Completion"
    const titleFontWidth = boldFont.widthOfTextAtSize(text, 18)
    page.drawText(text, {
        x: (pageWidth - titleFontWidth) / 2,
        y: pageHeight - 100,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
    })

    //draw a line
    page.drawLine({
        start: { x: 40, y: pageHeight - 120 },
        end: { x: pageWidth - 40, y: pageHeight - 120 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
    })

    //Add summary text
    const summaryText = "Summary"
    page.drawText(summaryText, {
        x: 40,
        y: pageHeight - 145,
        size: 17,
        font: boldFont,
        color: rgb(0, 0, 0),
    })

    let startYCoord = pageHeight - 170
    for (item of arr) {
        const { key, value } = item
        await drawSummary(pdfDocument, page, key, value, startYCoord)
        startYCoord = startYCoord - 22
    }

    

    const pdfBytes = await pdfDocument.saveAsBase64()
    fs.writeFile("pdfDoc.pdf", pdfBytes, "base64", (err) => err && console.log(err))
}

const drawSummary = async (pdfDocument, page, key, value, yCoord) => {
    const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
    const keyTextWidth = boldFont.widthOfTextAtSize(key, 12)
    page.drawText(key, {
        x: 40,
        y: yCoord,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
    })

    page.drawText(":", {
        x: 180,
        y: yCoord,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
    })

    page.drawText(value, {
        x: 200 + 20,
        y: yCoord,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
    })
}

createAuditTrailPdf()