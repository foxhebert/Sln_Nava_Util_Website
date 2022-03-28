using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebNavaUtil.Controllers
{
    public class ClienteController : Controller
    {
        private wsNavautil.IwsNavautilClient proxy;

        // GET: Cliente
        public ActionResult ConsultaCliente()
        {
            if (Session["NavaUsert"] != null)
            {
                wsNavautil.Usuario usuario = (wsNavautil.Usuario)Session["NavaUsert"];

                DateTime dateStart = DateTime.Now;
                DateTime dateEnd = DateTime.Now;
                var clientes = WSListarCliente(usuario.empresa, dateStart, dateEnd);
                ViewBag.VENDEDOR = new SelectList(WSlistarVendedor(), "codven", "nomven");
                return View(clientes);
            }
            else
                return RedirectToAction("LoginNavautil", "Login");
        }

        [HttpPost]
        public PartialViewResult FiltrarCliente(string fechaIni, string fechaFin, string ruc = "", string estado = "", string codVend = "", bool anulado = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.Cliente> list = WSListarCliente(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), ruc, estado, codVend, anulado);
                
                return PartialView("_partialFiltrarCliente", list);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarCliente(string fechaIni, string fechaFin, string ruc = "", string estado = "", string codVend = "", bool anulado = false)
        {
            wsNavautil.Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (wsNavautil.Usuario)Session["NavaUsert"];
                List<wsNavautil.Cliente> list = WSListarCliente(usuario.empresa, DateTime.Parse(fechaIni), DateTime.Parse(fechaFin), ruc, estado, codVend, anulado);

                var json = Json(list);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new { type = "error", message = "session expired" });

        }

        [HttpPost]
        public PartialViewResult DetalleComprobante(string id,string fechaIni,string fechaFin)
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
        public List<wsNavautil.Cliente> WSListarCliente(string empresa, DateTime fechaIni, DateTime FechaFin, string ruc="", string estado="", string codVend="", bool anulado=false)
        {
            List<wsNavautil.Cliente> lista = new List<wsNavautil.Cliente>();
            try
            {
                proxy = new wsNavautil.IwsNavautilClient();
                lista = proxy.consultarCliente(empresa,fechaIni, FechaFin, ruc, estado, codVend, anulado).ToList();
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
                comprobante = proxy.ConsultarComprobante(empresa, fechaIni,fechaFin,id).ToList();
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
        #endregion métodos

    }
}