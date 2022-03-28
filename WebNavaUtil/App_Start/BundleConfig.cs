using System.Web;
using System.Web.Optimization;

namespace WebNavaUtil
{
    public class BundleConfig
    {
        // Para obtener más información sobre las uniones, visite https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
                    "~/Content/assets/css/dashboard.css",
                    "~/Content/assets/plugins/charts-c3/plugin.css",
                    "~/Content/assets/plugins/datapicker/css/datepicker3.css",
                    "~/Content/assets/plugins/datatables/css/dataTables.bootstrap4.css",
                    "~/Content/assets/plugins/datatables/css/fixedHeader.bootstrap.css",
                    "~/Content/assets/plugins/datatables/css/responsive.bootstrap.css",
                    "~/Content/assets/plugins/datatables/css/select.dataTables.css",
                    "~/Content/assets/plugins/ambiance/css/jquery.ambiance.css"
                     ));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Content/assets/js/vendors/jquery-3.2.1.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                     "~/Content/assets/js/vendors/bootstrap.bundle.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/javascript").Include(
                    "~/Content/assets/js/vendors/jquery.sparkline.min.js",
                    "~/Content/assets/js/vendors/selectize.min.js",
                    "~/Content/assets/js/vendors/jquery.tablesorter.min.js",
                    "~/Content/assets/js/vendors/circle-progress.min.js",
                    "~/Content/assets/plugins/datapicker/js/bootstrap-datepicker.js",
                    "~/Content/assets/plugins/moment/moment-with-locales.js",
                    "~/Content/assets/plugins/datatables/js/jquery.dataTables.js",
                    "~/Content/assets/plugins/datatables/js/dataTables.select.min.js",
                    "~/Content/assets/plugins/moment/datetime-moment.js",
                    "~/Content/assets/plugins/datatables/js/dataTables.fixedHeader.js",
                    "~/Content/assets/plugins/datatables/js/dataTables.responsive.js",
                    "~/Content/assets/plugins/datatables/js/responsive.bootstrap.js",
                    "~/Content/assets/plugins/ambiance/js/jquery.ambiance.js",
                    "~/Content/assets/plugins/blockUI/jquery.blockUI.js",
                    "~/Content/assets/js/core.js"));

            //Utilice la versión de desarrollo de Modernizr para desarrollar y obtener información. De este modo, estará
            //para la producción, use la herramienta de compilación disponible en https://modernizr.com para seleccionar solo las pruebas que necesite.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

        }
    }
}
