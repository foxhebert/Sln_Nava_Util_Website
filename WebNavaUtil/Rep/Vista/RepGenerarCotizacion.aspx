<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="RepGenerarCotizacion.aspx.cs" Inherits="WebNavaUtil.Rep.Vista.RepGenerarCotizacion" %>

<%@ Register assembly="CrystalDecisions.Web, Version=13.0.4000.0, Culture=neutral, PublicKeyToken=692fbea5521e1304" namespace="CrystalDecisions.Web" tagprefix="CR" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
        <script type="text/javascript" src="/crystalreportviewers13/js/crviewer/crv.js">
        </script> 
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <CR:CrystalReportViewer ID="ReporteAccesoWeb" runat="server" AutoDataBind="true" />
        </div>
        <div id="Container" runat="server">
            <h1 id="txtMensaje" runat="server">No existen datos calculados.</h1>
        </div>
    </form>
</body>
</html>

