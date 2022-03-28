using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebNavaUtil.Controllers
{
    public class PedidoController : Controller
    {
       private wsNavautil.IwsNavautilClient proxy ;

        // GET: Pedido
        public ActionResult ConsultaPedido()
        {
            if (Session["NavaUsert"] != null)
            {
                wsNavautil.Usuario usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                //DateTime dateStart = DateTime.Parse("10/05/2018");
                DateTime dateStart = DateTime.Now;
                DateTime dateEnd = DateTime.Now;
                //var pedidos = new List<wsNavautil.Pedido>();
                var pedidos = WSConsultarPedido(usuario.empresa, dateStart, dateEnd);
                ViewBag.VENDEDOR = new SelectList(listarVendedor(), "codven", "nomven");
                return View(pedidos);
            }
            else
                return RedirectToAction("LoginNavautil", "Login");
        }

        //POST: Filtrar Pedido
        [HttpPost]
        public PartialViewResult FiltrarPedido(string fechaIni, string fechaFin, string nroPedido = "", string estado = "1", string vendedor = "", string ruc="",bool anulados = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.Pedido> list = WSConsultarPedido(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), nroPedido, estado, vendedor,ruc ,anulados);
                //GC.Collect();
                return PartialView("_partialFiltrarPedido", list);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarPedido(string fechaIni, string fechaFin, string nroPedido = "", string estado = "1", string vendedor = "", string ruc = "", bool anulados = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.Pedido> list = WSConsultarPedido(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), nroPedido, estado, vendedor, ruc, anulados);
                //GC.Collect();
                var json = Json(list);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new {type="error",message="session expired" });

        }

        //POST: detalle pedido
        [HttpPost]
        public PartialViewResult DetallePedido(string ndocu)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.DetallePedido> lisDetalle = listarDetalle(usuario.empresa, ndocu);
                return PartialView("_partialDetallePedido", lisDetalle);
            }
            else
                return PartialView("_partialSessionExpired");
            
        }

        //POST: impresion pedido
        [HttpPost]
        public JsonResult imprimePedido(string ndocu,string coment)
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
        //Métodos de conexión
        private List<wsNavautil.Pedido> WSConsultarPedido(string empresa,DateTime fechaIni,DateTime fechaFin,string nroPedido="",string estado="",string vendedor="",string ruc="",bool anulados=false)
        {
            List<wsNavautil.Pedido> lista = new List<wsNavautil.Pedido>();
            try
            {
               
                proxy = new wsNavautil.IwsNavautilClient();
                lista = proxy.ListarPedido(empresa,fechaIni,fechaFin, nroPedido, estado,vendedor,ruc,anulados).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return lista;
        }

        private List<wsNavautil.Vendedor> listarVendedor()
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

        private List<wsNavautil.DetallePedido> listarDetalle(string empresa,string ndocu)
        {
            List<wsNavautil.DetallePedido> detalle = new List<wsNavautil.DetallePedido>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                detalle = proxy.listarDetallePedido(empresa,"32",ndocu).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return detalle;
        }

        private wsNavautil.Respuesta WSimprimirPedido(string empresa,string ndocu,string comentario)
        {
            wsNavautil.Respuesta resp =new  wsNavautil.Respuesta();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                resp = proxy.ImpresionTicket(empresa, ndocu, comentario,false);
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