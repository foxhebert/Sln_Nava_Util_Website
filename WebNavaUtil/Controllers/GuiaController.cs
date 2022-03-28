using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebNavaUtil.Controllers
{
    public class GuiaController : Controller
    {
        private wsNavautil.IwsNavautilClient proxy;

        // GET: Guia
        public ActionResult ConsultarGuia()
        {
            if (Session["NavaUsert"] != null)
            {
                try
                {
                    wsNavautil.Usuario usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                    DateTime dateStart = DateTime.Now;
                    DateTime dateEnd = DateTime.Now;
                    var guias = WSconsultarGuia(usuario.empresa, dateStart, dateEnd);
                    ViewBag.VENDEDOR = new SelectList(WSlistarVendedor(usuario.empresa), "codven", "nomven");
                    return View(guias);
                }
                catch (Exception ex)
                {
                    return View();
                    throw new Exception(ex.Message);
                    
                }
                
            }
            else
                return RedirectToAction("LoginNavautil", "Login");
        }

        //POST: Filtrar Guia
        [HttpPost]
        public PartialViewResult FiltrarGuia(string fechaIni, string fechaFin, string nroGuia = "", string estado = "", string vendedor = "", bool anulados = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                List<wsNavautil.Guía> list = WSconsultarGuia(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), nroGuia, estado, vendedor, anulados);
                return PartialView("_partialFiltrarGuiaCabecera", list);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarGuia(string fechaIni, string fechaFin, string nroGuia = "", string estado = "", string vendedor = "", bool anulados = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                List<wsNavautil.Guía> list = WSconsultarGuia(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), nroGuia, estado, vendedor, anulados);
                var json = Json(list);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new { type = "error", message = "session expired" });

        }

        //POST: detalleGuia
        [HttpPost]
        public PartialViewResult DetalleGuia(string nroGuia)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                List<wsNavautil.DetalleGuia> listaDetalleGuia = WSconsultarDetalleGuia(usuario.empresa, nroGuia);
                return PartialView("_partialDetalleGuia", listaDetalleGuia);
            }
            else
                return PartialView("_partialSessionExpired");
            
        }

        [HttpPost]
        public JsonResult imprimirEtiqueta(wsNavautil.Guía guia,int cant)
        {
            wsNavautil.Respuesta response = WSimprimirEtiqueta(guia,cant);
            return Json(response);
        }

        public JsonResult imprimeGuia(string ndocu, string coment)
        {
            wsNavautil.Usuario usuario = null;
            wsNavautil.Respuesta objRespuesta = new wsNavautil.Respuesta();
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                objRespuesta = WSimprimirPedido(usuario.empresa, ndocu, coment);
                return Json(objRespuesta);
            }
            else
            {
                objRespuesta.type = "error";
                objRespuesta.message = "Su sesión expiró, inicie sesión nuevamente.";
                return Json(objRespuesta);
            }
           
        }

        #region Métodos
        private List<wsNavautil.Guía> WSconsultarGuia(string empresa, DateTime fechaIni, DateTime FechaFin, string nroGuia="", string estado="", string vendedor="", bool anulados=false)
        {
            List<wsNavautil.Guía> listaGuia = new List<wsNavautil.Guía>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                listaGuia = proxy.ListarGuia(empresa,fechaIni,FechaFin,nroGuia,estado,vendedor,anulados).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return listaGuia;
        }

        private List<wsNavautil.Vendedor> WSlistarVendedor(string empresa)
        {
            List<wsNavautil.Vendedor> list = new List<wsNavautil.Vendedor>();
            try
            {
                    proxy = new wsNavautil.IwsNavautilClient();
                    list = proxy.ListarVendedor(empresa).ToList();
                    proxy.Close();
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return list;
        }

        private List<wsNavautil.DetalleGuia> WSconsultarDetalleGuia(string empresa,string ndocu)
        {
            List<wsNavautil.DetalleGuia> listDetailGuia = new List<wsNavautil.DetalleGuia>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                listDetailGuia = proxy.ListarDetalleGuia(empresa,"09",ndocu).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return listDetailGuia;
        }

        private wsNavautil.Respuesta WSimprimirEtiqueta(wsNavautil.Guía guia,int cantidad)
        {
            wsNavautil.Respuesta response= null;
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                response=proxy.ImprimirEtiqueta(guia,cantidad);
                proxy.Close();
            }
            catch (Exception ex)
            {
                response.message = "Problemas con la impresión de etiqueta";
                response.type = "error";
            }
            return response;
        }

        private wsNavautil.Respuesta WSimprimirPedido(string empresa, string ndocu, string comentario)
        {
            wsNavautil.Respuesta resp = new wsNavautil.Respuesta();

            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                resp = proxy.ImpresionTicket(empresa, ndocu, comentario, true);
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return resp;
        }
        #endregion Métodos

    }
}