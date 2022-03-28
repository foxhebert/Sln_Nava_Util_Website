using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebNavaUtil.wsNavautil;

namespace WebNavaUtil.Controllers
{
    public class StockController : Controller
    {
        private IwsNavautilClient proxy;


        // GET: Stock
        public ActionResult ConsultaStock()
        {
            if (Session["NavaUsert"] != null)
            {
                Usuario usuario = (Usuario)Session["NavaUsert"];

                var productos = new List<Producto>();
                ViewBag.ALMACEN = new SelectList(WSlistarAlmacen(usuario.empresa), "codalm", "nomalm");
                ViewBag.FAMILIA = new SelectList(WSlistarLinea(usuario.empresa), "codfam", "nomfam");

                return View(productos);
            }
            else
                return RedirectToAction("LoginNavautil", "Login");
        }

        [HttpPost]
        public JsonResult cargarSubLinea(string codFamilia)
        {
            List<SubFamilia> subFamilia = new List<SubFamilia>();
            string type = "";
            try
            {
                if (Session["NavaUsert"] != null)
                {
                    type = "success";
                    Usuario usuario = (Usuario)Session["NavaUsert"];
                    subFamilia = WSlistarSubFamilia(usuario.empresa, codFamilia);
                }
                else
                    type = "error";


            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
            return Json(new { tipo = type, datos = subFamilia }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult cargarGrupo(string codSubFam)
        {
            List<Grupo> grupo = new List<Grupo>();
            string type = "";
            try
            {
                if (Session["NavaUsert"] != null)
                {
                    type = "success";
                    Usuario usuario = (Usuario)Session["NavaUsert"];
                    grupo = WSlistarGrupo(usuario.empresa, codSubFam);
                }
                else
                    type = "error";

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return Json(new { tipo = type, datos = grupo }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public PartialViewResult filtrarProducto(string codSubFam, string desGrupo, string codAlmac, string estado, string codProdu, string descProdu)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                if (estado.Equals(""))
                    estado = "1";
                List<Producto> listaProdu = wsListarProducto(usuario.empresa, codSubFam, desGrupo, codAlmac, estado, codProdu, descProdu);

                return PartialView("_partialFiltrarProducto", listaProdu);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public JsonResult jsonFiltrarProducto(string codSubFam, string desGrupo, string codAlmac, string estado, string codProdu, string descProdu)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                if (estado.Equals(""))
                    estado = "1";
                List<Producto> listaProdu = wsListarProducto(usuario.empresa, codSubFam, desGrupo, codAlmac, estado, codProdu, descProdu);

                var json = Json(listaProdu);
                json.MaxJsonLength = 500000000;
                return json;
            }
            else
                return Json(new { type = "error", message = "session expired" });

        }

        [HttpPost]
        public PartialViewResult movimientoProducto(string codProdu, string chk)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];
                if (chk.Equals(""))
                    chk = "02";
                List<Movimiento> movimientos = WSlistarMovimiento(usuario.empresa, codProdu, chk);

                return PartialView("_partialMovimientoProdu", movimientos);
            }
            else
                return PartialView("_partialSessionExpired");

        }

        [HttpPost]
        public PartialViewResult getDatosProducto(string codprodu)
        {
            Usuario usuario = null;
            if (Session["NavaUsert"] != null)
            {
                usuario = (Usuario)Session["NavaUsert"];

                Producto obj = null;
                using (proxy = new IwsNavautilClient())
                {
                    obj = proxy.DatosProducto(usuario.empresa, codprodu);
                    proxy.Close();
                }

                //return PartialView("_partialDatosProducto", obj);
                return PartialView("_partialDatosProducto", obj);
            }
            else
                return PartialView("_partialSessionExpired");
        }

        [HttpPost]
        public JsonResult jsonActualizarProducto(string codprodu, decimal uca)
        {
            Usuario usuario = null;
            string tipo = "";
            string mensaje = "";
            try
            {
                bool update = false;
                if (Session["NavaUsert"] != null)
                {
                    usuario = (Usuario)Session["NavaUsert"];
                    using (proxy = new IwsNavautilClient())
                    {
                        update = proxy.ActualizarProducto(usuario.empresa, codprodu, uca);
                        proxy.Close();
                    }
                    if (update)
                    {
                        tipo = "success";
                        mensaje = "Se actualizó correctamente el producto";

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
                mensaje = "Inconveniente al actualizar el producto";
                throw new Exception(ex.Message);
            }

            return Json(new { type = tipo, message = mensaje });
        }


        #region métodos
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

        private List<SubFamilia> WSlistarSubFamilia(string empresa, string codFam)
        {
            List<SubFamilia> listaSubFam = new List<SubFamilia>();
            try
            {
                proxy = new IwsNavautilClient();
                listaSubFam = proxy.ListarSubFamilia(empresa, codFam).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return listaSubFam;
        }

        private List<Grupo> WSlistarGrupo(string empresa, string codSub)
        {
            List<Grupo> listaGrupo = new List<Grupo>();
            try
            {
                proxy = new IwsNavautilClient();
                listaGrupo = proxy.ListarGrupo(empresa, codSub).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return listaGrupo;
        }

        private List<Producto> wsListarProducto(string empresa, string codSubFam = "", string desGrupo = "", string codAlmac = "", string estado = "", string codProdu = "", string descProdu = "")
        {
            List<Producto> listaProdu = new List<Producto>();
            try
            {
                proxy = new IwsNavautilClient();
                listaProdu = proxy.ListarProdStockCAB(empresa, codSubFam, "01", desGrupo, codAlmac, estado, codProdu, descProdu).ToList();
                proxy.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return listaProdu;
        }

        private List<Movimiento> WSlistarMovimiento(string empresa, string codProdu, string chk)
        {
            List<Movimiento> listaMov = new List<Movimiento>();
            try
            {
                proxy = new IwsNavautilClient();
                listaMov = proxy.ListarMovProdu(empresa, codProdu, chk).ToList();
                proxy.Close();

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return listaMov;
        }

        #endregion métodos





    }
}