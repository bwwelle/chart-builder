using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;

namespace ImageMagickWebService
{
    /// <summary>
    /// Summary description for ConverttoPng
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    //[System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class ConverttoPng : System.Web.Services.WebService
    {        
        [WebMethod]
        public byte[] ConvertSVGtoPNG(string svgCode)
        {
            string batFileLocation = ConfigurationManager.AppSettings["BatFileLocation"];

            using (System.IO.StreamWriter file = new System.IO.StreamWriter(batFileLocation + "ConvertImage.svg", true))
                file.WriteLine(svgCode);

            var p = new Process();
            string svgFileName = batFileLocation + "ConvertImage.svg";
            string pngFileName = batFileLocation + "ConvertedImage.png";

            p.StartInfo.Arguments = string.Format("{0} {1}", svgFileName, pngFileName);
            p.StartInfo.FileName = batFileLocation + "ConvertImage.bat";
            p.Start();

            byte[] pngByteArray = File.ReadAllBytes(pngFileName);

            return pngByteArray;
        }
    }
}
