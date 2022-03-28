using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace WebNavaUtil
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        ////Añadido debido a que no se muestra la imagen del Crystal en el Navegador
        //protected void Application_BeginRequest(object sender, EventArgs e)
        //{
        //    var p = Request.Path.ToLower().Trim();
        //    if (p.EndsWith("/crystalimagehandler.aspx") && p != "/crystalimagehandler.aspx")
        //    {
        //        var fullPath = Request.Url.AbsoluteUri.ToLower();
        //        var NewURL = fullPath.Replace(".aspx", "");
        //        Response.Redirect(NewURL);
        //    }
        //}

    }

}




