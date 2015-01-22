using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
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
        public string ConvertSVGtoPNG(string svgCode)
        {
            string batFileLocation = ConfigurationManager.AppSettings["BatFileLocation"];
            string serverPath = ConfigurationManager.AppSettings["ServerPath"];
            string hash = "";
            var currentTime = DateTime.Now.ToString("hhmmss");
            byte[] svgByteArray = Encoding.UTF8.GetBytes(svgCode);

            using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
                hash = Convert.ToBase64String(sha1.ComputeHash(svgByteArray));

            hash = Regex.Replace(hash, "[^0-9a-zA-Z]+", ""); ;

            using (System.IO.StreamWriter file = new System.IO.StreamWriter(batFileLocation + hash + "_" + currentTime + ".svg", true))
                file.WriteLine(svgCode);

            var p = new Process();           

            string svgFileName = batFileLocation + hash + "_" + currentTime + ".svg";
            string pngFileName = batFileLocation + hash + "_" + currentTime + ".png";

            p.StartInfo.Arguments = string.Format("{0} {1}", svgFileName, pngFileName);
            p.StartInfo.FileName = batFileLocation + "ConvertImage.bat";
            p.Start();

            Thread.Sleep(100);

            File.Delete(svgFileName);

            return serverPath + hash + "_" + currentTime + ".png";
        }
    }
}
