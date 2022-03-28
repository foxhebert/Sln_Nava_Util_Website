using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using WebNavaUtil.wsNavautil;

namespace WebNavaUtil.Controllers
{

    public class CotizacionController : Controller
    {
        private wsNavautil.IwsNavautilClient proxy;

        public ActionResult NuevoFeriado()
        {
            return PartialView("_PartialNuevoFeriado");//_PartialNuevoFeriado
        }

        // GET: Cotizacion
        public ActionResult GenerarCotizacion()
        {
            //return View();
            if (Session["NavaUsert"] != null)
            {
                wsNavautil.Usuario usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                DateTime dateStart = DateTime.Now;
                DateTime dateEnd = DateTime.Now;
                var clientes = WSListarCliente(usuario.empresa);
                //var clientes = WSListarCliente(usuario.empresa, dateStart, dateEnd);
                ViewBag.VENDEDOR = new SelectList(WSlistarVendedor(), "codven", "nomven"); 

                //CONDICION 
                ViewBag.CONDICION = new SelectList(WSlistarCondicion(), "cboCod", "cboDes");
                //TIP DE CAMBIO
                //ViewBag.TIPOCAMBIO = new SelectList(WSlistarTipoCambio(), "cboCod", "cboDes").FirstOrDefault();
                IList<ComboGeneral> list = WSlistarTipoCambio();
                ViewBag.TIPOCAMBIO = list[0].cboDes;

                //AÑADIDO PARA COTIZACION HGM 02.09.2021                
                ViewBag.ALMACEN = new SelectList(WSlistarAlmacen(usuario.empresa), "codalm", "nomalm");
                ViewBag.FAMILIA = new SelectList(WSlistarLinea(usuario.empresa), "codfam", "nomfam");


                //ViewModel mymodel = new ViewModel();
                //mymodel.Teachers = GetTeachers();
                //mymodel.Students = GetStudents();
                var productos = new List<Producto>();

                object[] datos = { clientes, productos };

                //return View(clientes);
                return View(datos);
            }
            else
                return RedirectToAction("LoginNavautil", "Login");

        }


        //AÑADIDO PARA COTIZACION HGM 28.09.2021
        private List<Almacen> WSlistarAlmacen(string empresa)
        {
            List<Almacen> listaAlmac = new List<Almacen>();
            try
            {
                proxy = new IwsNavautilClient();
                listaAlmac = proxy.ListarAlmacen(empresa).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return listaAlmac;
        }

        //AÑADIDO PARA COTIZACION HGM 28.09.2021
        private List<Familia> WSlistarLinea(string empresa)
        {
            List<Familia> listaFamilia = new List<Familia>();
            try
            {
                proxy = new IwsNavautilClient();
                listaFamilia = proxy.ListarFamilia(empresa).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return listaFamilia;
        }

        //AÑADIDO PARA COTIZACION HGM 05.10.2021
        [HttpPost]
        public PartialViewResult getDatosProductoAniadir(string codprodu,string precioPro, string costPro, string mstoPro, string moneitemPro, string aigvPro 
            )
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                Producto obj = null;
                using (proxy = new IwsNavautilClient())
                {
                    obj = proxy.DatosProductoCotiz(usuario.empresa, codprodu, precioPro, costPro, mstoPro, moneitemPro, aigvPro   );  //DatosProducto
                    proxy.Close();
                }
                //return PartialView("_partialDatosProducto", obj);
                return PartialView("_partialModalAniadirProducto", obj);
            }
            else
                return PartialView("_partialSessionExpired");
        }

        [HttpPost]
        //public PartialViewResult FiltrarCliente(string fechaIni, string fechaFin, string ruc = "", string estado = "", string codVend = "", bool anulado = false)
        public PartialViewResult FiltrarCliente( string ruc = "", string codVend = "")
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.ClienteCotizacion> list = WSListarCliente(usuario.empresa,  ruc,  codVend);
                //List<wsNavautil.Cliente> list = WSListarCliente(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), ruc, estado, codVend, anulado);
                return PartialView("_partialFiltrarCliente", list);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarCliente(string ruc = "",  string codVend = "")
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.ClienteCotizacion> list = WSListarCliente(usuario.empresa, ruc, codVend);
                //List<wsNavautil.Cliente> list = WSListarCliente(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), ruc, estado, codVend, anulado);

                var json = Json(list);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new { type = "error", message = "session expired" });

        }

        [HttpPost]
        public PartialViewResult DetalleComprobante(string id, string fechaIni, string fechaFin)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.Comprobante> listComprobante = WSconsultarComprobante(usuario.empresa, id, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin));
                return PartialView("_partialDetalleComprobante", listComprobante);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        #region métodos
        public List<wsNavautil.ClienteCotizacion> WSListarCliente(string empresa,  string ruc = "", string codVend = "")
        {
            List<wsNavautil.ClienteCotizacion> lista = new List<wsNavautil.ClienteCotizacion>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                lista = proxy.consultarClienteCotizacion(empresa, ruc,  codVend).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return lista;
        }

        private List<wsNavautil.Comprobante> WSconsultarComprobante(string empresa, string id, DateTime fechaIni, DateTime fechaFin)
        {
            List<wsNavautil.Comprobante> comprobante = new List<wsNavautil.Comprobante>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                comprobante = proxy.ConsultarComprobante(empresa, fechaIni, fechaFin, id).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return comprobante;
        }

        private List<wsNavautil.Vendedor> WSlistarVendedor()
        {
            List<wsNavautil.Vendedor> list = new List<wsNavautil.Vendedor>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarVendedor(usuario.empresa).ToList();
                    proxy.Close();
                }
                else
                    return list;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return list;
        }

        private List<wsNavautil.ComboGeneral> WSlistarCondicion()
        {
            List<wsNavautil.ComboGeneral> list = new List<wsNavautil.ComboGeneral>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    String strfiltroCombo = "CONDVTA";
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarComboGeneral(usuario.empresa, strfiltroCombo, "").ToList();
                    proxy.Close();
                }
                else
                    return list;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return list;
        }

        private List<wsNavautil.ComboGeneral> WSlistarTipoCambio()
        {
            List<wsNavautil.ComboGeneral> list = new List<wsNavautil.ComboGeneral>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    String strfiltroCombo = "TIPOCAMBIO";
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarComboGeneral(usuario.empresa, strfiltroCombo, "").ToList();
                    proxy.Close();
                }
                else
                    return list;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return list;
        }




        #endregion métodos


        #region cotizaciones


        [HttpPost]//jsonActualizarProducto
        public JsonResult jsonGrabarCotizacion(CabeceraCotizacion CabeCotizacion, List<wsNavautil.DetalleCotizacion> DetaCotizacion)
        {
            Usuario usuario = null;
            string tipo = "";
            string mensaje = "";

            try
            {
                bool grabar = false;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (Usuario)Session["NavaUsert"];
                    using (proxy = new IwsNavautilClient())
                    {
                        //jsonActualizarProducto
                        //ActualizarProducto
                        //update = proxy.GrabarCotizacion(usuario.empresa, codprodu, uca);
                        //CabeceraCotizacion CabeCotizacion, List<DetalleCotizacion> DetaCotizacion
                        //List<wsNavautil.Cliente> DetaCotizacion
                        //CabeceraCotizacion CabeCotizacion = new CabeceraCotizacion();
                        //List<wsNavautil.DetalleCotizacion> DetaCotizacion = new List<DetalleCotizacion>();

                        grabar = proxy.GrabarCotizacion(usuario.empresa, CabeCotizacion, DetaCotizacion.ToArray());//
                        proxy.Close();
                    }
                    if (grabar)
                    {
                        tipo = "success";
                        mensaje = "Se inserto la Cotización";

                    }
                }
                else
                {
                    tipo = "error";
                    mensaje = "session expired";
                }
            }
            catch (Exception ex)
            {
                tipo = "error";
                mensaje = "Inconveniente al inseertar cotizacion";
                throw new Exception(ex.Message);
            }

            return Json(new { type = tipo, message = mensaje });
        }

        //PREGUARDADO PARA COTIZACION HGM 14.10.2021
        [HttpPost] 
        public PartialViewResult getDatosPreGuardado(string strFiltro)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                Producto obj = null;
                ViewBag.TIPOENTREGA   = new SelectList(WSlistarCombo("TIPOENTREGA", ""), "cboCod", "cboDes");
                ViewBag.TRANSPORTISTA = new SelectList(WSlistarCombo("TRANSPORTISTA", ""), "cboCod", "cboDes");
                ViewBag.ATENCION = new SelectList(WSlistarCombo("ATENCION", strFiltro), "cboCod", "cboDes");

                return PartialView("_partialModalPreGuardado");

            }
            else
                return PartialView("_partialSessionExpired");
        }

        private List<wsNavautil.ComboGeneral> WSlistarCombo(string strfiltroCombo, string strSegundoFiltro  )
        {
            List<wsNavautil.ComboGeneral> list = new List<wsNavautil.ComboGeneral>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarComboGeneral(usuario.empresa, strfiltroCombo, strSegundoFiltro).ToList();
                    proxy.Close();
                }
                else
                    return list;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return list;
        }

        [HttpPost]
        public PartialViewResult filtrarProductoCotiz(string codSubFam, string desGrupo, string codAlmac, string estado, string codProdu, string descProdu)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                if (estado.Equals(""))
                    estado = "1";
                List<Producto> listaProdu = wsListarProductoCotiz(usuario.empresa, codSubFam, desGrupo, codAlmac, estado, codProdu, descProdu);

                return PartialView("_partialFiltrarProductoCotiz", listaProdu);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarProductoCotiz(string codSubFam, string desGrupo, string codAlmac, string estado, string codProdu, string descProdu, string tcam, string mone)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                if (estado.Equals(""))
                    estado = "1";
                List<Producto> listaProdu = wsListarProductoCotiz(usuario.empresa, codSubFam, desGrupo, codAlmac, estado, codProdu, descProdu, tcam, mone);

                var json = Json(listaProdu);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new { type = "error", message = "session expired" });

        }

        private List<Producto> wsListarProductoCotiz(string empresa, string codSubFam = "", string desGrupo = "", string codAlmac = "", string estado = "", string codProdu = "", string descProdu = "", string tcam="", string mone="")
        {
            List<Producto> listaProdu = new List<Producto>();
            try
            {
                proxy = new IwsNavautilClient();
                listaProdu = proxy.ListarProdStockCotiz(empresa, codSubFam, "01", desGrupo, codAlmac, estado, codProdu, descProdu, tcam, mone).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return listaProdu;
        }


        //TRAER IGV PRUEBA
        public JsonResult getIgvCotizacion(string strfiltroCombo, string strSegundoFiltro)
        {

            List<wsNavautil.ComboGeneral> list = new List<wsNavautil.ComboGeneral>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarComboGeneral(usuario.empresa, strfiltroCombo, strSegundoFiltro).ToList();
                    proxy.Close();
                }
                else
                    //return list;
                    return Json(list);
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            //return list;


            return Json(list);


            //int intResult = 1;

            //string strMsjDB = "";

            //string strMsgUsuario = "";

            //List<TbBienesMov> Listado = new List<TbBienesMov>();
            //try
            //{

            //    using (proxy = new PersonalSrvClient())
            //    {

            //        Listado = proxy.ListarTablaTbBienesPrueba(82517, 1, 3, 3029, "", ref intResult, ref strMsjDB, ref strMsgUsuario).ToList();
            //        proxy.Close();
            //    }

            //}
            //catch (Exception ex)
            //{
            //    Log.AlmacenarLogError(ex, "PersonalController.cs");
            //}

            //return Json(Listado);


        }

        //TRAER CRRELATIVO
        public JsonResult getCorrelativoCotizacion()
        {
            string cNroDocu = "";
            List<wsNavautil.Correlativo> list = new List<wsNavautil.Correlativo>();
            try
            {
                wsNavautil.Usuario usuario = null;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.getCorrelativoCotizacion(usuario.empresa, ref  cNroDocu).ToList();
                    proxy.Close();
                }
                else

                    return Json(cNroDocu);
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }

            string root = Server.MapPath("~");//
            string parent = Path.GetDirectoryName(root);
            string grandParent = Path.GetDirectoryName(parent);


            url = (System.Web.HttpContext.Current.Request.Url.AbsoluteUri).Replace("/LoginSiscop/LoginSiscop/", "");
            var context = System.Web.HttpContext.Current;
            string ip = String.Empty;

            if (context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null)
                ip = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
            else if (!String.IsNullOrWhiteSpace(context.Request.UserHostAddress))
                ip = context.Request.UserHostAddress;

            if (ip == "::1")
                ip = "127.0.0.1";

            strIpHost = ip;



            return Json(cNroDocu);

        }

        //CLASE MODELO PARA EL LISTADO DESDE EL JS
        public class listado_cabecera_cotiz
        {
            public string rucCliente { get; set; }
            public string nomCliente { get; set; }
            public string condVenta { get; set; }
            public string moneda { get; set; }
            public string vendedor { get; set; }
            public string codCliente { get; set; }
            public string dirClient { get; set; }
            public string tlfCliente { get; set; }
            public string atteCliente { get; set; }
            public string Observacion { get; set; }
        }

        public static listado_cabecera_cotiz DatosEncabezado;//añadido 02.11.2021
        public JsonResult SetDatosEncabezado(string _rucCliente, string _nomCliente, string _codCliente, string _dirEntCliente, string _tlfCliente, string _atte, string _obser2)
        {
            try
            {
                listado_cabecera_cotiz ObjCabecera = new listado_cabecera_cotiz();
                ObjCabecera.rucCliente = _rucCliente;
                ObjCabecera.nomCliente = _nomCliente;
                ObjCabecera.codCliente = _codCliente;
                ObjCabecera.dirClient = _dirEntCliente;
                ObjCabecera.tlfCliente = _tlfCliente;
                ObjCabecera.atteCliente = _atte;
                ObjCabecera.Observacion = _obser2;

                DatosEncabezado = ObjCabecera;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return Json("");
        }





        #endregion


        public static string url { get; set; }  
            public static string texto { get; set; }
            public static string textoConfig { get; set; }
            public static string pieConfig { get; set; }
            public static string strIpHost { get; set; }   

            //OBTENER EL IP CON CODIGIGO C# - A Nivel WebSite
            public string GetUserIPAddress()
            {

                url = (System.Web.HttpContext.Current.Request.Url.AbsoluteUri).Replace("/LoginSiscop/LoginSiscop/", "");
                var context = System.Web.HttpContext.Current;
                string ip = String.Empty;

                if (context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null)
                    ip = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
                else if (!String.IsNullOrWhiteSpace(context.Request.UserHostAddress))
                    ip = context.Request.UserHostAddress;

                if (ip == "::1")
                    ip = "127.0.0.1";

                strIpHost = ip;
                //string ipaddress = Request.UserHostAddress;
                return ip;
            }
    








        }
}