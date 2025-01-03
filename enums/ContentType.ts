export enum ContentType {
     JavaArchive = "application/java-archive",
     EDIX12 = "application/EDI-X12",
     EDIFACT = "application/EDIFACT",
     /**
      * @deprecated The method should not be used
     */
     ApplicationJavascript = "application/javascript",
     OctetStream = "application/octet-stream",
     OGG = "application/ogg",
     PDF = "application/pdf",
     XHtmlXML = "application/xhtml+xml",
     ShockwaveFlash = "application/x-shockwave-flash",
     Json = "application/json",
     LdJson = "application/ld+json",
     ApplicationXML = "application/xml",
     ZIP = "application/zip",
     WWWFormURLEncoded = "application/x-www-form-urlencoded",

     mpeg = "audio/mpeg",
     WMA = "audio/x-ms-wma",
     VNDRNREALAUDIO = "audio/vnd.rn-realaudio",
     WAV = "audio/x-wav",

     GIF = "image/gif",
     JPEG = "image/jpeg",
     PNG = "image/png",
     TIFF = "image/tiff",
     MicrosoftIcon = "image/vnd.microsoft.icon",
     DJVU = "image/vnd.djvu",
     SVG = "image/svg+xml",

     Mixed = "multipart/mixed",
     Alternative = "multipart/alternative",
     Related = "multipart/related",
     FormData = "multipart/form-data",

     CSS = "text/css",
     CSV = "text/csv",
     EventStream = "text/event-stream",
     Html = "text/html",
     Javascript = "text/javascript",
     PlainText = "text/plain",
     XML = "text/xml"
}