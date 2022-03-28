using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebNavaUtil.Controllers;
using WebNavaUtil.wsNavautil;

namespace WebNavaUtil.Controllers
{
    public class LoginController : Controller
    {
        public static List<Emisor> DatosEmisor;//añadido 02.11.2021
        private wsNavautil.IwsNavautilClient proxy;

        // GET: Login
        public ActionResult LoginNavautil()
        {
            if (Session["NavaUsert"] != null)
            {
                return RedirectToAction("ConsultaPedido", "Pedido");
            }
            else
                return View();
        }

        [HttpPost]
        public ActionResult LoginNavautil(string empresa,string nomAcceso,string clave)
        {
            try
            {
                string success = "";
                wsNavautil.Usuario objUsu = Identificate(empresa,nomAcceso,clave,ref success);
                if (success.Equals(""))
                {
                    objUsu.empresa = empresa;
                    Session["NavaUsert"] = objUsu;
                    //añadido 02.11.2021
                    int Rpta = WSlistarEmisor();
                    return RedirectToAction("ConsultaPedido", "Pedido");
                }
                else
                {
                    TempData["ERROR_LOGIN"] = success;
                    return View();
                }
            }
            catch (Exception ex)
            {
                return View();
                throw new Exception(ex.Message);
            }
        }

        public ActionResult closeSessionNava()
        {
            try
            {
                Session.Clear();
                return RedirectToAction("LoginNavautil", "Login");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        //AÑADIDO 02.11.2021
        public int WSlistarEmisor()
        {
            // List<Emisor> listaEmisor = new List<Emisor>();
            int Rpta = 0;
            try
            {
                Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (Usuario)Session["NavaUsert"];
                }

                proxy = new IwsNavautilClient();
                DatosEmisor = proxy.ListarEmisor(usuario.empresa).ToList();
                proxy.Close();
                //DatosEmisor = listaEmisor;
                if (DatosEmisor.Count() == 1) { Rpta = 1; }
                else
                {
                    Rpta = 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            // 
            return Rpta;
        }



        #region Métodos
        private wsNavautil.Usuario Identificate(string empresa,string strNoAcceso,string clave,ref string jellyBean)
        {
            wsNavautil.Usuario usuario = null;
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                usuario = proxy.ValidarUsuarioNavaUtil(empresa,strNoAcceso,clave,ref jellyBean);
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return usuario;
        }
        #endregion Métodos
    }
}