using WebNavaUtil.Controllers;
using CrystalDecisions.CrystalReports.Engine;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//Traer lista de la Ventana Principal
using System.Web.Mvc;
//using System.Drawing;
using WebNavaUtil.wsNavautil;
using System.Configuration;




namespace WebNavaUtil.Rep.Vista//CBX_Web_SISCOP.Rep.Vista
{

     public partial class RepGenerarCotizacion  : System.Web.UI.Page //RepInventarioPorLineaProduccion //RepAccesoWeb
    {
        //LISTA ESTATICA
        public static List<listado_detalle_cotiz> listadoDetalle_;
           
        //List<wsNavautil.Usuario> list = new List<Dominio.Entidades.ASISTENCIA_CRYSTAL>();
        //CLASE MODELO PARA EL LISTADO DESDE EL JS
        public class listado_detalle_cotiz
        {
        public string   idProdu       { get; set; }
        public string   codProdu      { get; set; }
        public string   cantProdu     { get; set; }
        public string   descProdu     { get; set; }
        public string   UM            { get; set; }
        public string   marcaProdu    { get; set; }
        public string   nomfam        { get; set; }
        public string   nomsub        { get; set; }
        public string   nomgrup       { get; set; }
        public string   stockFisico   { get; set; }
        public string   stockDispon   { get; set; }
        public string   dsctPercent   { get; set; }
        public string   precio        { get; set; }
        public string   cost          { get; set; }
        public string   msto          { get; set; }
        public string   moneitem      { get; set; }
        public string   aigv          { get; set; }
        public string   tota          { get; set; }
        public string   totn          { get; set; }
       }
        [System.Web.Services.WebMethod]
        public static void ListaDetalleCotiz(List<listado_detalle_cotiz> listadoDetalleCotiz)
        {
            listadoDetalle_ = listadoDetalleCotiz;
        }

        private ReportDocument Rel;

        protected void Page_PreInit(object sender, EventArgs e)
        {

            Container.Visible = false;
            //string arrayEncabezadoCrystal
            //int zoomLevel = int.Parse((Request.QueryString["zoomLevel"]));
            //string chkConFoto = Request.QueryString["chkConFoto"];

            string filtroDeReporte = Request.QueryString["filtroDeReporte"];
            string valorSubTotal   = Request.QueryString["valorSubTotal"];
            string valorTotalIgv   = Request.QueryString["valorTotalIgv"];
            string valorTotal      = Request.QueryString["valorTotal"];
            string vendedor        = Request.QueryString["vendedor"];
            string condVenta       = Request.QueryString["condVenta"];
            string moneda          = Request.QueryString["moneda"];
            string validez         = Request.QueryString["validez"];
            string correlativo     = Request.QueryString["correlativo"];

            //añadir parte decimal
            if (!valorSubTotal.Contains("."))
            {
                valorSubTotal = valorSubTotal + ".00";
            }
            if (!valorTotalIgv.Contains("."))
            {
                valorTotalIgv = valorTotalIgv + ".00";
            }
            if (!valorTotal.Contains("."))
            {
                valorTotal = valorTotal + ".00";
            }

            try
            {
                //añadido 02.11.2021
                List<Emisor> DatosEmisor = new List<Emisor>();
                DatosEmisor = LoginController.DatosEmisor;
                //añadido 02.11.2021

                CotizacionController.listado_cabecera_cotiz DatosEncabezado = new CotizacionController.listado_cabecera_cotiz();
                DatosEncabezado = CotizacionController.DatosEncabezado;

                DataTable tb = ConvertDataTable(listadoDetalle_);

                if (1> 0) //list.Count 
                {

                    //https://www.tektutorialshub.com/crystal-reports/how-to-download-and-install-crystal-report-runtime/
                    Rel = new ReportDocument();
                    Rel.Load(Server.MapPath("~/Rep/CrystalRep/GenerarCotizacion/RepGenerarCotizacion.rpt"));
                    Rel.SetDataSource(tb);
                    //Conseguir el nombre de la carpeta en el server con Webconfig
                    string relativePath = ConfigurationManager.AppSettings["rutaLogo"];
                    //Conbinar la carpeta con otro string 
                    string logoImagen = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, relativePath + DatosEmisor[0].LOGO);
                    //string logoImagen = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, relativePath + "tecflex_imagen.png");//comentado 02.11.2021
                    //Obtiene la rais y lo combina de frente sin webconfig
                    //string pathToFiles = Server.MapPath("/LogoTecflex/tecflex_imagen.png");//comentado 02.11.2021
                    //Otener el http del server(del proyecto)
                    string baseUrl = Request.Url.Scheme + "://" + Request.Url.Authority +
                           Request.ApplicationPath.TrimEnd('/') + logoImagen;


                    Rel.SetParameterValue("condVenta", condVenta);
                    Rel.SetParameterValue("moneda", moneda);
                    Rel.SetParameterValue("vendedor", vendedor);
                    Rel.SetParameterValue("valorSubTotal", valorSubTotal );
                    Rel.SetParameterValue("valorTotalIgv", valorTotalIgv );
                    Rel.SetParameterValue("valorTotal", valorTotal);
                    Rel.SetParameterValue("validez", validez);
                    Rel.SetParameterValue("correlativo", correlativo);
                    Rel.SetParameterValue("logoImagen", baseUrl);
                    Rel.SetParameterValue("rucEmisor", DatosEmisor[0].RUC);
                    Rel.SetParameterValue("dirEmisor", DatosEmisor[0].DIRECCION);
                    Rel.SetParameterValue("tlfEmisor", DatosEmisor[0].TLF);
                    Rel.SetParameterValue("wspEmisor", DatosEmisor[0].WSP);
                    Rel.SetParameterValue("emailEmisor", DatosEmisor[0].EMAIL);
                    Rel.SetParameterValue("rucCliente", DatosEncabezado.rucCliente);
                    Rel.SetParameterValue("nomCliente", DatosEncabezado.nomCliente);
                    Rel.SetParameterValue("dirCliente", DatosEncabezado.dirClient);
                    Rel.SetParameterValue("tlfCliente", DatosEncabezado.tlfCliente);
                    Rel.SetParameterValue("atteCliente", DatosEncabezado.atteCliente); //añadido 03.11.2021
                    Rel.SetParameterValue("Observacion", DatosEncabezado.Observacion); //añadido 03.11.2021


                    if (Request.QueryString["pdf"] != null)
                    {
                        ExportPDF(Rel, filtroDeReporte);
                    }
                    if (Request.QueryString["excel"] != null)
                    {
                        ExportExcel(Rel, filtroDeReporte);
                    }

                    //EL OBJETO ReporteInventPorUbicacion TIENE QUE ESTAR EN:     protected global::CrystalDecisions.Web.CrystalReportViewer ReporteInventPorUbicacion;
                    ReporteAccesoWeb.ReportSource = Rel;
                    ReporteAccesoWeb.ToolPanelView = CrystalDecisions.Web.ToolPanelViewType.None;
                    ReporteAccesoWeb.HasToggleGroupTreeButton = false;

                }
                else
                {
                    Container.Visible = true;
                    txtMensaje.InnerHtml = "La tabla Asistencia no contiene registros.";
                }

            }
            catch (Exception ex)
            {
                Log.AlmacenarLogError(ex, "RepGenerarCotizacion.aspx.cs");
                Container.Visible = true;
                txtMensaje.InnerHtml = "Ocurrió un problema.";
            }
        }


        protected void Page_Unload(object sender, EventArgs e)
        {
            if (Rel != null)
            {
                if (Rel.IsLoaded)
                {
                    Rel.Close();
                    Rel.Dispose();
                }
            }
        }

        ////////////////////////////////////////////////////////////
        //CRYSTAL EN PDF
        ////////////////////////////////////////////////////////////
        public void ExportPDF(ReportDocument Rel, string filtroDeReporte)
        {

            BinaryReader stream = new BinaryReader(Rel.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat));
            Response.ClearContent();
            Response.ClearHeaders();
            Response.ContentType = "application/pdf";
            Response.BinaryWrite(stream.ReadBytes(Convert.ToInt32(stream.BaseStream.Length)));

            Response.AddHeader("content-disposition", @" attachment; filename=""Cotización.pdf"" ");

            Response.Flush();
            Response.Close();
        }


        /* */
        ////////////////////////////////////////////////////////////
        //CRYSTAL EN EXCEL
        ////////////////////////////////////////////////////////////
        public void ExportExcel(ReportDocument Rel, string filtroDeReporte)
        {
            BinaryReader stream = new BinaryReader(Rel.ExportToStream(CrystalDecisions.Shared.ExportFormatType.Excel));
            Response.ClearContent();
            Response.ClearHeaders();
            Response.ContentType = "application/vnd.ms-excel";
            Response.BinaryWrite(stream.ReadBytes(Convert.ToInt32(stream.BaseStream.Length)));
            Response.AddHeader("content-disposition", @"attachment;filename=""Cotización.xls""");
            Response.Flush();
            Response.Close();
        }
       


        public static DataTable ConvertDataTable<TItemType>(List<TItemType> list)
        {
            DataTable convertedData = new DataTable();

            // Get List Item Properties info
            Type itemType = typeof(TItemType);
            PropertyInfo[] publicProperties =
                // Only public non inherited properties
                itemType.GetProperties(BindingFlags.Instance | BindingFlags.Public);

            // Create Table Columns
            foreach (PropertyInfo property in publicProperties)
            {
                // DataSet does not support System.Nullable<>
                if (property.PropertyType.IsGenericType &&
                    property.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>))
                {
                    // Set the column datatype as the nullable value type
                    convertedData.Columns.Add(property.Name, property.PropertyType.GetGenericArguments()[0]);
                }
                else
                {
                    convertedData.Columns.Add(property.Name, property.PropertyType);
                }
            }

            // Convert the Data
            foreach (TItemType item in list)
            {
                object[] rowData = new object[convertedData.Columns.Count];
                int rowDataIndex = 0;
                // Iterate through Item Properties
                foreach (PropertyInfo property in publicProperties)
                {
                    // Add a single cell data
                    rowData[rowDataIndex] = property.GetValue(item, null);
                    rowDataIndex++;
                }
                convertedData.Rows.Add(rowData);
            }

            return convertedData;
        }



    }
}
