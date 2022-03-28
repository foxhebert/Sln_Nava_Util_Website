using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebNavaUtil.Controllers
{
    public class Log
    {
        public static void AlmacenarLogError(Exception excepcion, string strNombreArchivo = "")
        {
            try
            {
                StreamWriter objWriter = null;
                FileStream objFile = null;
                DirectoryInfo objDirectorio = null;

                string rutaLog = ConfigurationManager.AppSettings["RutaLog"];
                if (rutaLog.Equals(""))
                    rutaLog = "c:\temp";

                objDirectorio = new DirectoryInfo(rutaLog);
                if (!objDirectorio.Exists)
                {
                    objDirectorio.Create();
                }
                foreach (FileInfo objFileOld in objDirectorio.GetFiles("*.log"))
                {
                    if (objFileOld.LastAccessTime.AddDays(60) < DateTime.Now)
                    {
                        objFileOld.Delete();
                    }
                }

                objFile = new FileStream(objDirectorio.FullName + "\\LogError" + DateTime.Now.ToString("yyyy-MM-dd") + ".log", FileMode.OpenOrCreate, FileAccess.Write);

                objWriter = new StreamWriter(objFile);
                objWriter.BaseStream.Seek(0, SeekOrigin.End);
                objWriter.WriteLine("[________________________________________________________________________]");
                objWriter.WriteLine("[Fecha         ][" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "]");
                objWriter.WriteLine("[Source        ][" + excepcion.Source + "]");
                objWriter.WriteLine("[Mensaje       ][" + excepcion.Message + "]");
                objWriter.WriteLine("[StackTrace    ][" + excepcion.StackTrace + "]");
                if (excepcion.InnerException != null)
                    if (excepcion.InnerException.Message != null)
                        objWriter.WriteLine("[InnerException][" + excepcion.InnerException.Message + "]");

                objWriter.WriteLine();
                objWriter.Flush();
                objWriter.Close();
                objFile.Close();

            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }
        public static void AlmacenarLogMensaje(string strMensaje)
        {
            try
            {
                StreamWriter objWriter = null;
                FileStream objFile = null;
                DirectoryInfo objDirectorio = null;


                string rutaLog = ConfigurationManager.AppSettings["RutaLog"];
                if (rutaLog.Equals(""))
                    rutaLog = "c:\temp";

                objDirectorio = new DirectoryInfo(rutaLog);
                if (!objDirectorio.Exists)
                {
                    objDirectorio.Create();
                }
                foreach (FileInfo objFileOld in objDirectorio.GetFiles("*.log"))
                {
                    if (objFileOld.LastAccessTime.AddDays(60) < DateTime.Now)
                    {
                        objFileOld.Delete();
                    }
                }

                objFile = new FileStream(objDirectorio.FullName + "\\Log" + DateTime.Now.ToString("yyyy-MM-dd") + ".log", FileMode.OpenOrCreate, FileAccess.Write);

                objWriter = new StreamWriter(objFile);
                objWriter.BaseStream.Seek(0, SeekOrigin.End);
                objWriter.WriteLine("[________________________________________________________________________]");
                objWriter.WriteLine("[Mensaje       ][" + strMensaje + "]");
                objWriter.WriteLine();
                objWriter.Flush();
                objWriter.Close();
                objFile.Close();

            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }
    }
}
