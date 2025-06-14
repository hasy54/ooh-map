export function validateIndianGST(gst: string): { isValid: boolean; error?: string } {
  if (!gst) return { isValid: true } // Optional field

  // Remove spaces and convert to uppercase
  const cleanGST = gst.replace(/\s/g, "").toUpperCase()

  // Check length
  if (cleanGST.length !== 15) {
    return { isValid: false, error: "GST number must be 15 characters long" }
  }

  // Check format: 2 digits + 10 alphanumeric + 1 digit + 1 letter + 1 alphanumeric
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

  if (!gstRegex.test(cleanGST)) {
    return { isValid: false, error: "Invalid GST number format" }
  }

  // Validate state code (first 2 digits should be between 01-37)
  const stateCode = Number.parseInt(cleanGST.substring(0, 2))
  if (stateCode < 1 || stateCode > 37) {
    return { isValid: false, error: "Invalid state code in GST number" }
  }

  return { isValid: true }
}

export function formatGSTNumber(gst: string): string {
  const cleanGST = gst.replace(/\s/g, "").toUpperCase()
  if (cleanGST.length <= 15) {
    // Format as: XX XXXXX XXXX X X Z X
    return cleanGST.replace(/(.{2})(.{5})(.{4})(.{1})(.{1})(.{1})(.{1})/, "$1 $2 $3 $4 $5 $6 $7").trim()
  }
  return cleanGST
}
