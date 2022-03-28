
/**
 *Index NavaUtil
 -------------------------
 1. Pedido
 2. Guía
 3. Stock
 4. Clientes

 */


let hexToRgba = function (hex, opacity) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let rgb = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;

  return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + opacity + ')';
};

/**
 *
 */
$(document).ready(function () {
    //set format date
    moment.locale('es');

    //set datatables.net sort dates columns
    $.fn.dataTable.moment('DD/MM/YYYY');

    /** Constant div card */
    const DIV_CARD = 'div.card';

    /** Initialize tooltips */
    $('[data-toggle="tooltip"]').tooltip();

    /** Initialize popovers */
    $('[data-toggle="popover"]').popover({
        html: true
    });

    /** Function for remove card */
    $('[data-toggle="card-remove"]').on('click', function (e) {
        let $card = $(this).closest(DIV_CARD);

        $card.remove();

        e.preventDefault();
        return false;
    });

    /** Function for collapse card */
    $('[data-toggle="card-collapse"]').on('click', function (e) {
        let $card = $(this).closest(DIV_CARD);

        $card.toggleClass('card-collapsed');

        e.preventDefault();
        return false;
    });

    /** Function for fullscreen card */
    $('[data-toggle="card-fullscreen"]').on('click', function (e) {
        let $card = $(this).closest(DIV_CARD);

        $card.toggleClass('card-fullscreen').removeClass('card-collapsed');

        e.preventDefault();
        return false;
    });

    /**  */
    if ($('[data-sparkline]').length) {
        let generateSparkline = function ($elem, data, params) {
            $elem.sparkline(data, {
                type: $elem.attr('data-sparkline-type'),
                height: '100%',
                barColor: params.color,
                lineColor: params.color,
                fillColor: 'transparent',
                spotColor: params.color,
                spotRadius: 0,
                lineWidth: 2,
                highlightColor: hexToRgba(params.color, .6),
                highlightLineColor: '#666',
                defaultPixelsPerValue: 5
            });
        };


        $('[data-sparkline]').each(function () {
            let $chart = $(this);

            generateSparkline($chart, JSON.parse($chart.attr('data-sparkline')), {
                color: $chart.attr('data-sparkline-color')
            });
        });

    }

    /**  */
    if ($('.chart-circle').length) {

        $('.chart-circle').each(function () {
            let $this = $(this);

            $this.circleProgress({
                fill: {
                    color: tabler.colors[$this.attr('data-color')] || tabler.colors.blue
                },
                size: $this.height(),
                startAngle: -Math.PI / 4 * 2,
                emptyFill: '#F4F4F4',
                lineCap: 'round'
            });
        });

    }


    $('#date_1').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        todayHighlight: true,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true,
        format: "dd/mm/yyyy",
        language: 'es'
    });

    $('#date_2').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        todayHighlight: true,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true,
        format: "dd/mm/yyyy",
        language: 'es'
    });

    //set value of input date
    var date = new Date();
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    $('#date_1, #date_2').datepicker('setDate', today);

    _datatablePedido();
    _datatableDetallePedido();
    _datatableGuia();
    _datatableDetalleGuia();
    _datatableProducto();

    _datatableProductoCotiz();
    _datatableProductoStock();//Solo para ventana cotizacion

    _datatableMoviProducto();
    _datatableCliente();
    _datatableDetalleComprobante();

    //_datatableClienteCotiz();
    _datatableClienteCotiz();//Añadido HGM
    _datatableDetalleComprobanteCotiz();//Añadido HGM


  $('#mas-menos-filtros').click(function (){
      //Boton para la PRIMERA division HGM
      //alert('#mas-menos-filtros');
    var data = $(this).data('active');
    console.log(data);
    if (data === 'mas') {
      $('#div-filtros-pedido').show('fast');
      $(this).data('active', 'menos');
      $(this).html('<i class=""></i>Menos filtros'); //fe fe-minus mr-2
    } else {
      $('#div-filtros-pedido').hide('fast');
      $(this).data('active', 'mas');
      $(this).html('Más filtros'); //HGM <i ></i>class="fe fe-plus mr-2"
    }

  });

  $('#mas-menos-filtros-cotiz').click(function () {
      //Boton para la TERCERA division
      var data = $(this).data('active');
      console.log(data);
      if (data === 'mas-cotiz') {
          $('#div-filtros-pedido-cotiz').show('fast'); //HGM
          $(this).data('active', 'menos-cotiz');
          $(this).html('<i class=""></i>Menos filtros'); //fe fe-minus mr-2
      } else {
          $('#div-filtros-pedido-cotiz').hide('fast');
          $(this).data('active', 'mas-cotiz');
          $(this).html('Más filtros'); //HGM <i ></i>class="fe fe-plus mr-2"
      }
  });



});
//end document ready

//Funciones y Variables generales
var _tableLanguaje = {
  lengthMenu: 'Mostrar _MENU_ Items',
  info: 'Mostrar _START_ a _END_ de _TOTAL_ Items',
  infoEmpty: 'No hay Items para mostrar',
  search: 'Buscar: ',
  sSearchPlaceholder: 'Criterio de búsqueda',
  zeroRecords: 'No se encontraron registros coincidentes',
  infoFiltered: '(Filtrado de _MAX_ totales Items)',
  paginate: {
    previous: 'Anterior',
    next: 'Siguiente'
  }
}

function ToJavaScriptDate(value) {
  var pattern = /Date\(([^)]+)\)/;
  var results = pattern.exec(value);
  var dt = new Date(parseFloat(results[1]));
  var date = ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + dt.getFullYear();
  return date;
}

/**Enter key pressed */
function autoComplete(e) {
  //See notes about 'which' and 'key'
  if (e.keyCode == 13) {
    console.log('Key enter pressed');
    var ndocu = $('#noOrder').val();
    var longitud = ndocu.length;
    if (longitud <= 12) {
      var diferencia = 8 - longitud;

      if (diferencia >= 0) {
        var complete = '001-';
        for (let index = 0; index < diferencia; index++) {
          complete += '0';
        }
        $('#noOrder').val(complete + ndocu);
      }

    }

    return false;
  }
}


/**1. Pedido       */
/**--------------------------------------------------------------------- */

//Variables
var _varTablaPedido;
var _varTablaDetallePedido;

$('#btn-filtrar-pedido').on('click', function () {

  var date_Start = $('#date_1').val();
  var date_End = $('#date_2').val();
  var nOrder = $('#noOrder').val();
  var state = '';
  var salesman = '';
  var ruccli = '';
  var annulled = false;

  if (date_Start !== '' && date_End !== '') {
    var data = $('#mas-menos-filtros').data('active');
    if (data === 'menos') {
      state = $('#estado-pedido option:selected').val();
      salesman = $('#cboVendedor option:selected').val();
      ruccli = $('#txt-ruc-cli-ped').val();
      annulled = $('#chkAnnulled').is(':checked');
    }

    /*     console.log(date_Start);
        console.log(date_End);
        console.log(nOrder);
        console.log(state);
        console.log(salesman);
        console.log(annulled); */

    $.ajax({
      url: '/Pedido/jsonFiltrarPedido',
      type: 'POST',
      data: { fechaIni: date_Start, fechaFin: date_End, nroPedido: nOrder, estado: state, vendedor: salesman, ruc: ruccli, anulados: annulled },
      beforeSend: function () {
        $.blockUI({
          css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
          },
          message: 'Procesando consulta...'
        });
      },
      success: function (response) {
        if (response.type !== undefined && response.type === 'error')
          window.location.replace("/Login/LoginNavautil");
        else {
          if (response.length > 0)
            _datatablePedido(response);
          else
            _varTablaPedido.rows().clear().draw();
        }

      },
      complete: function () {
        $.unblockUI();
      },
      error: (xhr, status, error) => {
        alert('ERROR ' + xhr.status + ' ' + error);
        //console.log(JSON.stringify(error));
      }
    });

    /*  $.ajax({
       url: '/Pedido/FiltrarPedido',
       type: 'POST',
       data: { fechaIni: date_Start, fechaFin: date_End, nroPedido: nOrder, estado: state, vendedor: salesman, ruc: ruccli, anulados: annulled },
       beforeSend: function () {
         $.blockUI({
           css: {
             border: 'none',
             padding: '15px',
             backgroundColor: '#000',
             '-webkit-border-radius': '10px',
             '-moz-border-radius': '10px',
             opacity: .5,
             color: '#fff'
           },
           message: 'Procesando consulta...'
         });
       },
       success: function (response) {
         if (response.trim() !== '') {
           $('#pedido-cabecera-table').empty();
           //console.log(response);
           $('#pedido-cabecera-table').html(response);
           _varTablaPedido.destroy();
           _datatablePedido();
         }
       },
       complete: function () {
         $.unblockUI();
       },
       error: (xhr, status, error) => {
         alert('ERROR ' + xhr.status + ' ' + error);
       }
     }); */

  }

});


function detallePedido(nroDocu) {
  $('#lbl-det-nroPedido').html('<strong> Nroº:' + nroDocu + '</strong>');
  $.post(
    '/Pedido/DetallePedido',
    { ndocu: nroDocu },
    (response) => {
      if (response.trim() !== '') {
        $('#detalle-pedido-table').empty();
        //console.log(response);
        $('#detalle-pedido-table').html(response);
        _varTablaDetallePedido.destroy();
        _datatableDetallePedido();
      }

    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });

}

/**CAPTURAR FILA SELECCIONADA DE LA TABLA PEDIDO */
function capturarFilaPedido(row) {
  var fila = row.cells;
  var idFila = row.id;
  $('.datatable-pedido tbody').find("*").removeClass('table-success');
  $('#' + idFila).addClass('table-success');
  var nroPedido = fila[1].innerText.trim();
  $('#nroPedido-print').val(nroPedido);
  detallePedido(nroPedido);
}


//Impresión pedido
$('#btn-impresion-pedido').on('click', () => {

  $('#txt-comentario-print').val('');
  $('#modal-pedido-print').modal('show');

});

$('#btn-print-pedido').on('click', () => {
  var comentario = $('#txt-comentario-print').val();
  var nroPed = $('#nroPedido-print').val();
  console.log(comentario);
  console.log(nroPed);

  if (comentario !== '') {
    if (nroPed !== '') {
      $.post(
        '/Pedido/imprimePedido',
        { ndocu: nroPed, coment: comentario },
        (response) => {
          if (response !== null) {
            console.log(response);

            $.ambiance({
              message: response.message,
              title: "Impresión",
              type: response.type,
              timeout: 4,
              width: 500
            });

          }
          $('#modal-pedido-print').modal('hide');
        }
      ).fail(function (xhr, textStatus, errorThrown) {
        var errorMessage = xhr.status + ': ' + xhr.statusText
        alert(errorMessage);
      });
    } else {
      $.ambiance({
        message: 'seleccione un item de la tabla <strong>Listado de Pedidos</strong>',
        title: "Impresión",
        type: "warning",
        timeout: 2,
        width: 500
      });
    }


  } else {
    $.ambiance({
      message: 'Ingrese comentario para la impresión',
      title: "Impresión",
      type: "warning",
      timeout: 2,
      width: 500
    });

  }

});

//Funciones para las Tablas Pedido y Detalle Pedido
$('.datatable-pedido tbody').on('click', 'tr', function () {
  var dataT = _varTablaPedido.row(this).data();
  var nroPedido = dataT['nroPedido'];
  $('#nroPedido-print').val(nroPedido);

  detallePedido(nroPedido);

});

function _datatablePedido(data) {

  if (data !== undefined) {
    var count = 0;
    _varTablaPedido.destroy();
    _varTablaPedido = $('.datatable-pedido').DataTable({
      data: data,
      columns: [
        {
          data: '',
          render: (data, type, row) => {
            return count++;
          }
        },
        {
          width: '10%',
          data: 'nroPedido'
        },
        {
          data: 'fechaEmicion',
          render: (data, type, row) => {
            return ToJavaScriptDate(data);
          }
        },
        { data: 'cliente' },
        { data: 'vendedor' },
        { data: 'moneda' },
        { data: 'montoTotal' },
        { data: 'estado' },
        { data: 'cotizacion' },
        { data: 'facBolGuia' },
      ],
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      columnDefs: [
        {
          targets: [0],
          visible: false,
          searchable: false
        }
      ],
      select: {
        style: 'single'
      }
    });
  } else {
    _varTablaPedido = $('.datatable-pedido').DataTable({
      columns: [
        { data: '' },
        { data: 'nroPedido' },
        { data: 'fechaEmicion' },
        { data: 'cliente' },
        { data: 'vendedor' },
        { data: 'moneda' },
        { data: 'montoTotal' },
        { data: 'estado' },
        { data: 'cotizacion' },
        { data: 'facBolGuia' },
      ],
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      columnDefs: [
        {
          targets: [0],
          visible: false,
          searchable: false
        }
      ],
      select: {
        style: 'single'
      }
    });
  }

  //eliminar las filas de la tabla detalle pedido cuando la tabla pedido se dibuje nuevamente
  $('.datatable-pedido').on('draw.dt', function () {
    _varTablaDetallePedido
      .rows()
      .remove()
      .draw();

    $('#lbl-det-nroPedido').html('');
  });

}

function _datatableDetallePedido() {

  _varTablaDetallePedido = $('.datatable-detalle-pedido').DataTable({
    lengthMenu: [10, 25, 50],
    responsive: true,
    language: _tableLanguaje,
  });


}

/**--------------------------------------------------------------------- */



/**2. Guía       */
/**--------------------------------------------------------------------- */
//Variables tabla
var _vartablaGuia;
var _vartablaDetalleGuia;

$('#btn-search-guia').on('click', function () {
  var date_Start = $('#date_1').val();
  var date_End = $('#date_2').val();
  var nroGuia = $('#noOrder').val();
  var state = '';
  var salesman = '';
  var annulled = false;


  if (date_Start !== '' && date_End !== '') {
    var data = $('#mas-menos-filtros').data('active');
    if (data === 'menos') {
      state = $('#estado-guia option:selected').val();
      salesman = $('#cboVendedor option:selected').val();
      annulled = $('#chkAnnulled').is(':checked');
    }


    $.ajax({
      url: '/Guia/jsonFiltrarGuia',
      type: 'POST',
      data: { fechaIni: date_Start, fechaFin: date_End, nroGuia: nroGuia, estado: state, vendedor: salesman, anulados: annulled },
      beforeSend: function () {
        $.blockUI({
          css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
          },
          message: 'Procesando consulta...'
        });
      },
      success: function (response) {
        if (response.type !== undefined && response.type === 'error')
          window.location.replace("/Login/LoginNavautil");
        else {
          if (response.length > 0)
            _datatableGuia(response);
          else
            _vartablaGuia.rows().clear().draw();
        }
      },
      complete: function () {
        $.unblockUI();
      },
      error: (xhr, status, error) => {
        alert('ERROR ' + xhr.status + ' ' + error);
      }
    });


  }

});

// consultar detalle guía
function detalleGuia(nroGuia) {
  $('#lbl-det-nroGuia').html('<strong> Nroº: ' + nroGuia + ' </strong>');
  $.post(
    '/Guia/DetalleGuia',
    { nroGuia: nroGuia },
    (response) => {
      if (response.trim() !== '') {
        $('#detalle-guia-table').empty();
        $('#detalle-guia-table').html(response);
        _vartablaDetalleGuia.destroy();
        _datatableDetalleGuia();
      }

    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });
}

//funciones y diseño de las tablas guía y detalle guía
$('.datatable-Guia tbody').on('click', 'tr', function () {
  var dataT = _vartablaGuia.row(this).data();

  var nroGuia = dataT['nroGuia'];
  var cliente = dataT['rzCliente'];
  var ruccli = dataT['ruccli'];
  var direccion = dataT['dirent'];
  var empresa = dataT['transp'];

  /*   console.log('Nro Guia: ' + nroGuia.trim());
    console.log('Nombre Cliente: ' + cliente.trim());
    console.log('Ruc cliente: ' + ruccli.trim());
    console.log('Dirección: ' + direccion.trim());
    console.log('Empresa: ' + empresa.trim());
    console.log(''); */

  $('#nroGuia-print').val(nroGuia);
  $('#nom-cli-print').val(cliente);
  $('#ruccli-print').val(ruccli);
  $('#direccion-print').val(direccion);
  $('#empresa-print').val(empresa);

  detalleGuia(nroGuia);
});

function _datatableGuia(data) {

  var ocuColumnsDef = [
    {
      targets: [0],
      visible: false,
      searchable: false
    },
    {
      targets: [4],
      visible: false,
      searchable: false
    },
    {
      targets: [5],
      visible: false,
      searchable: false
    }, {
      targets: [9],
      visible: false,
      searchable: false
    }
  ];

  if (data !== undefined) {
    var count = 0;
    _vartablaGuia.destroy();
    _vartablaGuia = $('.datatable-Guia').DataTable({
      data: data,
      columns: [
        {
          data: '',
          render: (data, type, row) => {
            return count++;
          }
        },
        {
          width: '15%',
          data: 'nroGuia'
        },
        {
          width: '5%',
          data: 'fecha',
          render: (data, type, row) => {
            return ToJavaScriptDate(data);
          }
        },
        {
          width: '22%',
          data: 'rzCliente'
        },
        { data: 'ruccli' },
        { data: 'dirent' },
        {
          width: '5%',
          data: 'motivo'
        },
        {
          width: '18%',
          data: 'condVenta'
        },
        {
          width: '5%',
          data: 'moneda'
        },
        { data: 'transp' },
        {
          width: '10%',
          data: 'vendedor'
        },
        {
          width: '5%',
          data: 'montoTotal'
        },
        {
          width: '10%',
          data: 'facBol'
        },
        {
          width: '10%',
          data: 'docRef'
        },
      ],
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      columnDefs: ocuColumnsDef,
      select: {
        style: 'single'
      }
    });
  } else {
    _vartablaGuia = $('.datatable-Guia').DataTable({
      columns: [
        {
          data: ''
        },
        {
          width: '15%',
          data: 'nroGuia'
        },
        {
          width: '5%',
          data: 'fecha'
        },
        {
          width: '22%',
          data: 'rzCliente'
        },
        { data: 'ruccli' },
        { data: 'dirent' },
        {
          width: '5%',
          data: 'motivo'
        },
        {
          width: '18%',
          data: 'condVenta'
        },
        {
          width: '5%',
          data: 'moneda'
        },
        { data: 'transp' },
        {
          width: '10%',
          data: 'vendedor'
        },
        {
          width: '5%',
          data: 'montoTotal'
        },
        {
          width: '10%',
          data: 'facBol'
        },
        {
          width: '10%',
          data: 'docRef'
        },
      ],
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      columnDefs: ocuColumnsDef,
      select: {
        style: 'single'
      }
    });
  }

  $('.datatable-Guia').on('draw.dt', function () {
    _vartablaDetalleGuia
      .rows()
      .remove()
      .draw();

    $('#lbl-det-nroGuia').html('');
  });

}

function _datatableDetalleGuia() {

  _vartablaDetalleGuia = $('.datatable-detalle-Guia').DataTable({
    lengthMenu: [10, 25, 50],
    responsive: true,
    language: _tableLanguaje,
  });

}

//Imprimir Ticket o Etiqueta

$('#btn-preguntar-impresion').on('click', function () {

  $('#rdb-print-ticket').prop('checked', false);
  $('#rdb-print-etiqueta').prop('checked', false);
  $('#div-print-comentario').hide('fast');
  $('#div-print-cantidad').hide('fast');
  $('#coment-print').val('');
  $('#canti-print').val('1')

  $('#idModalPregunta').modal('show');
});

$('#rdb-print-ticket').on('change', () => {

  $('#div-print-cantidad').hide('fast');
  var rdbPrintTicket = $('#rdb-print-ticket').is(':checked');

  if (rdbPrintTicket) {
    $('#div-print-comentario').show('fast');
  }

});

$('#rdb-print-etiqueta').on('change', () => {

  $('#div-print-comentario').hide('fast');
  var rdbPrintEtiqueta = $('#rdb-print-etiqueta').is(':checked');

  if (rdbPrintEtiqueta) {
    $('#div-print-cantidad').show('fast');
  }

});


$('#btn-print-guia').on('click', function () {

  var rdbPrintEtiqueta = $('#rdb-print-etiqueta').is(':checked');
  var rdbPrintTicket = $('#rdb-print-ticket').is(':checked');
  //nro guía
  var NoGuia = $('#nroGuia-print').val().trim();

  if (rdbPrintEtiqueta) {
    var Cantidad = $('#canti-print').val().trim();

    var NomCliente = $('#nom-cli-print').val().trim();
    var RucCliente = $('#ruccli-print').val().trim();
    var DirecCliente = $('#direccion-print').val().trim();
    var Empresa = $('#empresa-print').val().trim();

    if (Cantidad === '' | Cantidad === '0') {
      $.ambiance({
        message: 'Ingrese cantidad de Bultos mayor a 0  para la Impresión',
        title: "Impresión",
        type: "error",
        timeout: 5,
        width: 500
      });

      return false;
    }
    else {
      if (NoGuia === '' && NomCliente === '' && RucCliente === '' && DirecCliente === '') {

        $.ambiance({
          message: 'Vuelva a seleccionar el registro que desea imprimir',
          title: "Impresión",
          type: "error",
          timeout: 5,
          width: 500
        });

        return false;
      }
    }

    var Guia = {
      nroGuia: NoGuia,
      rzCliente: NomCliente,
      ruccli: RucCliente,
      dirent: DirecCliente,
      transp: Empresa
    };

    $.post(
      '/Guia/imprimirEtiqueta',
      { guia: Guia, cant: Cantidad },
      (response) => {
        if (response !== null) {

          $.ambiance({
            message: response.message,
            title: "Impresión",
            type: response.type,
            timeout: 5,
            width: 500
          });
        }
        $('#idModalPregunta').modal('hide');
      }
    ).fail(function (result) {
      alert('ERROR ' + result.status + ' ' + result.statusText);
    });
  } else {

    if (rdbPrintTicket) {
      var comentario = $('#coment-print').val().trim();
      if (comentario !== '') {

        $.post(
          '/Guia/imprimeGuia',
          { ndocu: NoGuia, coment: comentario },
          (response) => {
            if (response !== null) {
              console.log(response);

              $.ambiance({
                message: response.message,
                title: "Impresión",
                type: response.type,
                timeout: 4,
                width: 500
              });

            }
            $('#idModalPregunta').modal('hide');
          }
        ).fail(function (xhr, textStatus, errorThrown) {
          var errorMessage = xhr.status + ': ' + xhr.statusText
          alert(errorMessage);
        });

      } else {
        $.ambiance({
          message: 'Ingrese comentario para la impresión',
          title: "Impresión",
          type: "warning",
          timeout: 5,
          width: 500
        });
      }
    } else {
      $.ambiance({
        message: 'Seleccione tipo de impresión',
        title: "Impresión",
        type: "warning",
        timeout: 5,
        width: 500
      });
    }

  }

});


/**---------------------------------------------------------------------- */



/**3. Stock */
/**---------------------------------------------------------------------- */
//#region STOCK
//Variables
var _varTablaProducto;
var _varTablaProductoStock; //Solo para la ventana Cotizacion
var _varTablaMoviProducto;


$('#cboFamilia').on('change', function () {
  var codFam = $(this).val();
  cargarCBOsubLinea(codFam);
});

$('#cboSubLinea').on('change', function () {
  var codSubFam = $(this).val();
  cargarCBOGrupo(codSubFam);
});

//cargar combos dinámico (SUBLINEA)
function cargarCBOsubLinea(codFam) {

  $.post(
    '/Stock/cargarSubLinea',
    { codFamilia: codFam },
    (response) => {
      if (response.tipo === 'success') {

        if (response.datos.length > 0) {

          $('#cboSubLinea').empty();
          for (let index = 0; index < response.datos.length; index++) {
            if (index === 0) {
              $('#cboSubLinea').append('<option value="">Seleccione...</option>');
            }

            $('#cboSubLinea').append('<option value="' + response.datos[index].codsub + '">' + response.datos[index].nomsub + '</option>');
          }

        } else {
          $('#cboSubLinea').empty();
          $('#cboSubLinea').append('<option value="">Seleccione...</option>');
        }

      } else {
        $('#cboSubLinea').empty();
        $('#cboSubLinea').append('<option value="">Seleccione...</option>');

        if (response.tipo === 'error')
          $.ambiance({
            message: 'Su sesión a expirado, por favor inicie nuevamente',
            title: "Sesión Expirada",
            type: response.tipo,
            timeout: 4,
            width: 500
          });
      }


    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });
}

//cargar combo GRUPO
function cargarCBOGrupo(codSubFam) {

  $.post(
    '/Stock/cargarGrupo',
    { codSubFam: codSubFam },
    (response) => {
      /*  console.log(response); */

      if (response.tipo === 'success') {
        if (response.datos.length > 0) {
          $('#cboGrupo').empty();
          for (let index = 0; index < response.datos.length; index++) {
            if (index === 0) {
              $('#cboGrupo').append('<option value="">Seleccione...</option>');
            }

            $('#cboGrupo').append('<option value="' + response.datos[index].nomgru + '">' + response.datos[index].nomgru + '</option>');
          }

        } else {
          $('#cboGrupo').empty();
          $('#cboGrupo').append('<option value="">Seleccione...</option>');
        }
      }
      else {
        $('#cboGrupo').empty();
        $('#cboGrupo').append('<option value="">Seleccione...</option>');

        if (response.tipo === 'error')
          $.ambiance({
            message: 'Su sesión a expirado, por favor inicie nuevamente',
            title: "Sesión Expirada",
            type: response.tipo,
            timeout: 4,
            width: 500
          });
      }


    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });
}

//Boton Filtrar
$('#btn-search-produ-stock').on('click', function () {

  //Boton para la primera division HGM
  var almacen = $('#cboAlmacen option:selected').val();
  //var linea = $('#cboFamilia option:selected').val();
  var subLinea = $('#cboSubLinea option:selected').val();
  subLinea = subLinea.replace('-', '');
  var grupo = $('#cboGrupo option:selected').val();
  var estado = '';
  var descProdu = '';
  var codProdu = '';

  var data = $('#mas-menos-filtros').data('active');
  if (data === 'menos') {
    estado = $('#estado-produ option:selected').val();
    descProdu = $('#desc-produ').val();
    codProdu = $('#cod-produ').val();
  }

  if ((almacen !== '' && subLinea !== '') || descProdu !== '' || codProdu !== '') {

    $.ajax({
      url: '/Stock/jsonFiltrarProducto',
      type: 'POST',
      data: { codSubFam: subLinea, desGrupo: grupo, codAlmac: almacen, estado: estado, codProdu: codProdu, descProdu: descProdu },
      beforeSend: function () {
        $.blockUI({
          css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
          },
          message: 'Procesando consulta...'
        });
      },
      success: function (response) {
        if (response.type !== undefined && response.type === 'error')
          window.location.replace("/Login/LoginNavautil");
        else {
          if (response.length > 0)
            _datatableProducto(response);
          else
            _varTablaProducto.rows().clear().draw();
        }
      },
      complete: function () {
        $.unblockUI();
      },
      error: (xhr, status, error) => {
        alert('ERROR ' + xhr.status + ' ' + error);
      }
    });

  }

});

//Editar producto
$('#btn-editar-producto').on('click', () => {
  var data = _varTablaProducto.row('.selected').data();
  if (data !== undefined) {
    var _codProdu = data['codProdu'].trim();

    if (_codProdu === '') {
      $.ambiance({
          message: 'Seleccione un registro del "Listado de Stock".',
        title: "Actualizar Producto",
        type: "error",
        timeout: 4,
        width: 500
      });
      return;
    }

    $.post(
      '/Stock/getDatosProducto',
      { codprodu: _codProdu },
      (response) => {
        if (response.trim() !== '') {
          $('.modal-content-edit-produ').empty();
          $('.modal-content-edit-produ').html(response);
          $('#modal-editar-producto').modal('show');
        }

      }
    ).fail(function (result) {
      alert('ERROR ' + result.status + ' ' + result.statusText);
    });

  } else
    $.ambiance({
        message: 'Seleccione un registro del "Listado de Stock".',
      title: "Actualizar Producto",
      type: "error",
      timeout: 4,
      width: 300
    });


});

$('#btn-registrar-produ-edit').on('click', () => {

  var _codProducto = $('#txt-codProdu').val().trim();
  var _etiqXrollo = $('#txt-nroEtiquetas').val().trim();

  if (_codProducto !== '' && _etiqXrollo !== '') {
    $.post(
      '/Stock/jsonActualizarProducto',
      { codprodu: _codProducto, uca: _etiqXrollo },
      (response) => {
        if (response.type !== undefined) {
          $.ambiance({
            message: response.message,
            title: "Actualizar Producto",
            type: response.type,
            timeout: 4,
            width: 400
          });
          $('#modal-editar-producto').modal('hide');
        }

      }
    ).fail(function (result) {
      alert('ERROR ' + result.status + ' ' + result.statusText);
    });
  }

});


//Diseño de las tablas Pedido y detalle pedido
$('.datatable-producto tbody').on('click', 'tr', function () {
    //alert('.datatable - producto tbody');
  var dataT = _varTablaProducto.row(this).data();

  var codProdu = dataT['idProdu'];
  var codigo = dataT['codProdu'];
  var onlySales = '';
  $('#lbl-detMovi-produ').html('del Cód. Producto: <strong>' + codigo + '</strong>');

  $.post(
    '/Stock/movimientoProducto',
    { codProdu: codProdu, chk: onlySales },
    (response) => {
      if (response.trim() !== '') {
        $('#movimiento-produ-table').empty();
        $('#movimiento-produ-table').html(response);
        $('#chk-solo-ventas').data('cod-produ', codProdu);
        _varTablaMoviProducto.destroy();
        _datatableMoviProducto();
      }

    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });

});

//Filtar Producto
function _datatableProducto(data) {

  if (data !== undefined) {
    _varTablaProducto.destroy();
    _varTablaProducto = $('.datatable-producto').DataTable({
      data: data,
      columns: [
        {
          width: '16%',
          data: 'codProdu'
        },
        {
          width: '9%',
          data: 'marcaProdu'
        },
        {
          width: '30%',
          data: 'descProdu'
        },
        {
          width: '5%',
          data: 'UM'
        },
        {
          width: '10%',
          data: 'stockFisico'
        },
        {
          width: '',
          data: 'stockDispon'
        },
        {
          width: '',
          data: 'pedido'
        },
        {
          width: '',
          data: 'stockOtr'
        },
        { data: 'idProdu' }
      ],
      columnDefs: [
        {
          targets: [-1],
          visible: false,
          searchable: false
        }
      ],
      lengthMenu: [10, 25, 50],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      select: {
        style: 'single'
      }
    });
  } else {
    _varTablaProducto = $('.datatable-producto').DataTable({
      lengthMenu: [10, 25, 50],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
      columnDefs: [
        {
          targets: [-1],
          visible: false,
          searchable: false
        }
      ],
    });
  }

  $('.datatable-producto').on('draw.dt', function () {
    _varTablaMoviProducto
      .rows()
      .remove()
      .draw();

    $('#lbl-detMovi-produ').html('');
  });

  /*   $('.datatable-producto tbody').on('click', 'tr a.icon', function () {
      var data = _varTablaProducto.row($(this).parents('tr')).data();
      console.log(data);
    });
   */
}

function _datatableMoviProducto() {
  _varTablaMoviProducto = $('.datatable-movi-produ').DataTable({
    lengthMenu: [10, 25, 50],
    responsive: true,
    order: [[0, 'desc']],
    language: _tableLanguaje,
    columnDefs: [
      {
        targets: [0],
        visible: false,
        searchable: false
      }
    ],
  });

}

//deprecated
$('#chk-solo-ventas').on('change', function () {
  var chkVentas = $(this).is(':checked');
  var codProdu = $('#chk-solo-ventas').data('cod-produ');
  var onlySales = '02';

  if (chkVentas) {
    onlySales = '01';
    console.log('checked');
  }
  else {
    console.log('unchecked');
  }

  $.post(
    '/Stock/movimientoProducto',
    { codProdu: codProdu, chk: onlySales },
    (response) => {
      if (response.trim() !== '') {
        $('#movimiento-produ-table').empty();
        $('#movimiento-produ-table').html(response);
        _datatableMoviProducto();
      }

    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });

});

/**-------------------------------------------------------------------------------- */
//#endregion STOCK

/**4. Clientes */
/**-------------------------------------------------------------------------------- */
//#region CLIENTES
//Variables
var _varTablaCliente;
var _varTablaDetalleComprobante;

$('#btn-filtrar-cliente').on('click', function () {

  var date_Start = $('#date_1').val();
  var date_End = $('#date_2').val();
  var ruc_cli = $('#txt-ruc-cli').val();
  var salesman = '';
  var state = '';
  var annulled = false;

  if (date_Start !== '' && date_End !== '') {
    var data = $('#mas-menos-filtros').data('active');
    if (data === 'menos') {
      salesman = $('#cboVendedor option:selected').val();
      annulled = $('#chkAnnulled').is(':checked');
    }

    /*    console.log(date_Start);
       console.log(date_End);
       console.log(ruc_cli);
       console.log(salesman);
       console.log(annulled); */


    $.ajax({
      url: '/Cliente/jsonFiltrarCliente',
      type: 'POST',
      data: { fechaIni: date_Start, fechaFin: date_End, ruc: ruc_cli, estado: state, codVend: salesman, anulado: annulled },
      beforeSend: function () {
        $.blockUI({
          css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
          },
          message: 'Procesando consulta...'
        });
      },
      success: function (response) {
        if (response.type !== undefined && response.type === 'error')
          window.location.replace("/Login/LoginNavautil");
        else {
          if (response.length > 0)
            _datatableCliente(response);
          else
            _varTablaCliente.rows().clear().draw();
        }
      },
      complete: function () {
        $.unblockUI();
      },
      error: (xhr, status, error) => {
        alert('ERROR ' + xhr.status + ' ' + error);
      }
    });

  }


});

function detalleComprobante(id, nro) {
  $('#lbl-detComp-cliente').html('<strong> Nº: ' + nro + '</strong>');

  var date_Start = $('#date_1').val();
  var date_End = $('#date_2').val();

  $.post(
    '/Cliente/DetalleComprobante',
    { id: id, fechaIni: date_Start, fechaFin: date_End },
    (response) => {
      if (response.trim() !== '') {
        $('#contend-comprobante').empty();
        $('#contend-comprobante').html(response);
        _varTablaDetalleComprobante.destroy();
        _datatableDetalleComprobante();
      }

    }
  ).fail(function (result) {
    alert('ERROR ' + result.status + ' ' + result.statusText);
  });
}

//Diseño de las tablas Cliente y Detalle Comprobante
$('.datatable-cliente tbody').on('click', 'tr', function () {
  var dataT = _varTablaCliente.row(this).data();

  var idComprobante = dataT['id'];
  var nroComp = dataT['nroComprobante'];

  detalleComprobante(idComprobante, nroComp);

});

function _datatableCliente(data) {

  if (data !== undefined) {
    var count = 0;
    _varTablaCliente.destroy();
    _varTablaCliente = $('.datatable-cliente').DataTable({
      data: data,
      columns: [
        {
          data: '',
          render: (data, type, row) => {
            return count++;
          }
        },
        { data: 'id' },
        { data: 'nroComprobante' },
        {
          data: 'fecha',
          render: (data, type, row) => {
            return ToJavaScriptDate(data);
          }
        },
        { data: 'cliente' },
        { data: 'condVenta' },
        { data: 'moneda' },
        { data: 'vendedor' },
        { data: 'total' },
      ],
      columnDefs: [
        {
          targets: [0],
          visible: false,
          searchable: false
        },
        {
          targets: [1],
          visible: false,
          searchable: false
        }
      ],
      select: {
        style: 'single'
      },
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
    });
  } else {
    _varTablaCliente = $('.datatable-cliente').DataTable({
      columns: [
        { data: '' },
        { data: 'id' },
        { data: 'nroComprobante' },
        { data: 'fecha' },
        { data: 'cliente' },
        { data: 'condVenta' },
        { data: 'moneda' },
        { data: 'vendedor' },
        { data: 'total' },
      ],
      columnDefs: [
        {
          targets: [0],
          visible: false,
          searchable: false
        },
        {
          targets: [1],
          visible: false,
          searchable: false
        }
      ],
      select: {
        style: 'single'
      },
      lengthMenu: [10, 25, 50],
      order: [[0, 'asc']],
      scrollY: '300px',
      scrollX: true,
      scrollCollapse: true,
      language: _tableLanguaje,
    });
  }

  $('.datatable-cliente').on('draw.dt', function () {
    _varTablaDetalleComprobante
      .rows()
      .remove()
      .draw();

    $('#lbl-detComp-cliente').html('');
  });

}


function _datatableDetalleComprobante() {
  _varTablaDetalleComprobante = $('.datatable-comprob-cliente').DataTable({
    lengthMenu: [10, 25, 50],
    responsive: true,
    order: [[0, 'asc']],
    language: _tableLanguaje,
  });
}
/**---------------------------------------------------------------------------- */
//#endregion CLIENTES













/* --------------------------------------------------------------------- *//*
  5. Cotizacion    : Añadido en Octubre 2021 HGM 
     Desarrollador : Gonzales
*//* --------------------------------------------------------------------- */
//#region COTIZACION


//////////////////////////////////////////////////////////////////
// VALIDACION DECIMAL
//////////////////////////////////////////////////////////////////
function validarTC(evt) {
    //onkeypress = "validarCodigoAll(event)"
    //let k = event ? event.which : window.event.keyCode;
    //if (k == 32) return false;

    var theEvent = evt || window.event;
    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./; //Números, Letras ---> a-z,A-Z, _, - sin espacio, slash, guion, guion bajo
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }

}
//////////////////////////////////////////////////////////////////
// VALIDACION DECIMAL
//////////////////////////////////////////////////////////////////
function validarEntero(evt) {
    //onkeypress = "validarEntero(event)"
    //let k = event ? event.which : window.event.keyCode;
    //if (k == 32) return false;

    var theEvent = evt || window.event;
    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    if (key == 'e' || key == '.' || key == '+' || key == '-') {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    } else {
        var regex = /[0-9]|/; //Números, Letras ---> a-z,A-Z, _, - sin espacio, slash, guion, guion bajo
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
}
var datosCliente;
var rucCliente;
var nomCliente;
var condVenta;
var moneda;
var vendedor;
var arrayEncabezadoCotizacion = [];
var EncabezadoCotizacion = [];
var _varTablaProductoCotiz;
var _varTablaClienteCotiz;
let cantidad;
var listaProductosCotizar = new Array();


//////////////////////////////////////////////////////////////
//LISTADO CARGADO DE TABLA DE CLIENTES CARGAR TABLA
///////////////////////////////////////////////////////////////
function _datatableClienteCotiz(data) {

    if (data !== undefined) {
        var count = 0;
        //if (typeof _varTablaCliente !== 'undefined') {//añadido 03.11.2021
        //    _varTablaCliente.destroy();
        //}

        _varTablaCliente.destroy();
        _varTablaCliente = $('.datatable-cliente-cotiz').DataTable({
            data: data,
            columns: [
                {
                    data: '',
                    render: (data, type, row) => {
                        return count++;
                    }
                },
                { data: 'nomcli' },
                { data: 'ruccli' },
                { data: 'nomven' },
                { data: 'codcli' },

                { data: 'dircli' },
                { data: 'dirent' },
                { data: 'telcli' },

            ],
            columnDefs: [
                {
                    targets: [0],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [4],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [5],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [6],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [7],
                    visible: false,
                    searchable: false
                }
            ],
            select: {
                style: 'single'
            },
            lengthMenu: [10, 25, 50],
            order: [[0, 'asc']],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
        });
    } else {
        //este else es cuando se reinicializa en vacio la tabla
        //alert('_varTablaCliente')
        _varTablaCliente = $('.datatable-cliente-cotiz').DataTable({
            columns: [
                { data: '' },
                { data: 'campo1' },
                { data: 'campo2' },
                { data: 'campo3' },
                { data: 'campo4' },

                { data: 'campo5' },
                { data: 'campo6' },
                { data: 'campo7' },
                //{ data: 'cliente' },
                //{ data: 'condVenta' },
                //{ data: 'moneda' },
                //{ data: 'vendedor' },
                //{ data: 'total' },
            ],
            columnDefs: [
                {
                    targets: [0],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [4],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [5],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [6],
                    visible: false,
                    searchable: false
                }
                ,
                {
                    targets: [7],
                    visible: false,
                    searchable: false
                }
            ],
            select: {
                style: 'single'
            },
            lengthMenu: [10, 25, 50],
            order: [[0, 'asc']],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
        });
    }

    $('.datatable-cliente-cotiz').on('draw.dt', function () {
        _varTablaDetalleComprobanteCotiz // comentado 03.11.2021 _varTablaCliente//
            .rows()
            .remove()
            .draw();

        //$('#lbl-detComp-cliente').html(''); //comentado 03.11.2021
    });

}


///////////////////////////////////////////////////////////////////
//FILTRAR CLIENTES A LISTADO
///////////////////////////////////////////////////////////////////
$('#btn-filtrar-cliente-cotiz').on('click', function () {
    var ruc_cli = $('#txt-ruc-cli').val();
    var salesman = $('#cboVendedor option:selected').val();

    $.ajax({
        url: '/Cotizacion/jsonFiltrarCliente',
        type: 'POST',
        //data: { fechaIni: date_Start, fechaFin: date_End, ruc: ruc_cli, estado: state, codVend: salesman, anulado: annulled },
        data: { ruc: ruc_cli, codVend: salesman },
        beforeSend: function () {
            $.blockUI({
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                },
                message: 'Procesando consulta...'
            });
        },
        success: function (response) {

            if (response.type !== undefined && response.type === 'error')
                window.location.replace("/Login/LoginNavautil");
            else {
                if (response.length > 0)
                    _datatableClienteCotiz(response);
                else
                    _varTablaCliente.rows().clear().draw();
            }

        },
        complete: function () {
            $.unblockUI();
        },
        error: (xhr, status, error) => {
            alert('ERROR ' + xhr.status + ' ' + error);
        }
    });


});




///////////////////////////////////////////////////////////////////
//SELECCIONAR UN SOLO CLIENTE Y LLENAR OBJETO DE CABECERA
///////////////////////////////////////////////////////////////////
$('.datatable-cliente-cotiz tbody').on('click', 'tr', function () {
    //alert('.datatable-cliente-cotiz');
    var dataT = _varTablaCliente.row(this).data();
    var idComprobante = dataT['id'];
    var nroComp = dataT['nroComprobante'];
    ////detalleComprobanteCotiz(idComprobante, nroComp); //COMENTADO

    //Recoger los datos del Cliente seleccionado
    //=======================================================
    _rucCliente   = dataT['ruccli'];//datosCliente[0];
    _nomCliente   = dataT['nomcli'];//datosCliente[1];
    _condVenta    = $('#cboCondicionVenta option:selected').text().trim();//dataT['condVenta'];
    _moneda       = $('#cboModeda option:selected').val().trim(); //dataT['moneda'];
    _vendedor     = $('#cboVendedorB option:selected').text().trim();
    _codCliente = dataT['codcli'];
    //añadidos 02.11.2021 ------------------
    var _dirEntCliente = dataT['dirent'];
    var _tlfCliente = dataT['telcli'];
    //--------------------------------------

    //Llenamos en un objeto para llevarlo al aspx
    arrayEncabezadoCotizacion = [];
    arrayEncabezadoCotizacion.push({
         "rucCliente"   :   _rucCliente  ,
         "nomCliente"   :   _nomCliente  ,
         "condVenta"    :   _condVenta   ,
         "moneda"       :   _moneda      ,
        "vendedor"      : _vendedor,
        "dirCliente"    : _dirEntCliente,//añadido 02.11.2021
        "tlfCliente"    : _tlfCliente,//añadido 02.11.2021
    });

    ////////////////////////////////////////////////////////////
    EncabezadoCotizacion = [];
    EncabezadoCotizacion.push({
        "rucCliente": _rucCliente  ,
        "nomCliente": _nomCliente  ,
        "condVenta" : _condVenta   ,
        "moneda"    : _moneda      ,
        "vendedor"  : _vendedor    ,
        "codCliente": _codCliente,
        "dirCliente": _dirEntCliente,//añadido 02.11.2021
        "tlfCliente": _tlfCliente,//añadido 02.11.2021
    });

    //inicializando vacío las variables
    var _atte = ""; var _obser2 = "";
    //AÑADIDO 02.11.2021
    $.post(
        '/Cotizacion/SetDatosEncabezado',
        {
            _rucCliente, _nomCliente, _codCliente
            , _dirEntCliente//añadido 02.11.2021
            , _tlfCliente//añadido 02.11.2021
            , _atte//añadido 03.11.2021
            , _obser2//añadido 03.11.2021
        },
        response => {
            $('#txt-atencion-ver').val(_atte);
            $('#txt-dirent-ver').val(_dirEntCliente);
            $('#txt-obser-ver').val(_obser2);

            var codCliente = EncabezadoCotizacion[0].codCliente ? EncabezadoCotizacion[0].codCliente : ""; //"C03874"/ / 
            $.post(
                '/Cotizacion/getDatosPreGuardado',
                { strFiltro: codCliente },
                (response) => {
                    if (response.trim() !== '') {
                        $('.modal-content-cotizacion-pre-guardado').empty();
                        $('.modal-content-cotizacion-pre-guardado').html(response);

                        $('#modal-pre-cuardado').modal('show');
                        $('#cbo-transportista').val("00001");
                        $('#cbo-tipo-entrega').val("3");
                    }
                }
            ).fail(function (result) {
                alert('ERROR ' + result.status + ' ' + result.statusText);
            });
        });




    $('#cbo-atencion').on('change', function () {
        if (this.value == "0") {//if (this.value == "1000") {
            console.log("Paso por aquí")
            //alert(this.value);
            $("#div-atencion").show();
            $("#txt-ingrese-atencion").focus();
        }
        else {
            $("#div-atencion").hide();
        }
    });
});
/* ///////////////////////////////////////////////////////////////////////
                 BOTON OK
/////////////////////////////////////////////////////////////////////////*/
$('#confirmar-adicionales-cotizacion').on('click', () => {
    var _codCliente = EncabezadoCotizacion[0].codCliente;
    var _nomCliente = EncabezadoCotizacion[0].nomCliente;
    var _rucCliente = EncabezadoCotizacion[0].rucCliente;
    var _tlfCliente = EncabezadoCotizacion[0].tlfCliente;
    var _atte = "";

    if ($('#cbo-atencion  option:selected').val() != 0) {
        _atte = $('#cbo-atencion option:selected').text();
    }
    else
    {
        _atte = $('#txt-ingrese-atencion').val();
    }

    var _obser2 = $('#txt-observacion').val();
    _obser2 = _obser2.replace("\n", " ");//para quitar el salto de línea en caso exista.

    var _dirEntCliente = $('#txt-direccion-empresa').val();
    if (_dirEntCliente == "" || _dirEntCliente == null || _dirEntCliente == "undefined") {
        var _dirEntCliente = EncabezadoCotizacion[0].dirCliente;
    }
    _atte = _atte.toUpperCase();
    _dirEntCliente = _dirEntCliente.toUpperCase();
    _obser2 = _obser2.toUpperCase();


    //AÑADIDO 02.11.2021
    $.post(
        '/Cotizacion/SetDatosEncabezado',
        {
            _rucCliente, _nomCliente, _codCliente
            , _dirEntCliente//añadido 02.11.2021
            , _tlfCliente//añadido 02.11.2021
            , _atte//añadido 03.11.2021
            , _obser2//añadido 03.11.2021
        },
        response => {
            console.log("Prueba")
            
            $('#txt-atencion-ver').val(_atte);
            $('#txt-dirent-ver').val(_dirEntCliente);
            $('#txt-obser-ver').val(_obser2);
            $('#modal-pre-cuardado').modal('hide');
        });


});






///////////////////////////////////////////////////////////////////
//Filtar Producto para listado Stock de Cotizacion
///////////////////////////////////////////////////////////////////
function _datatableProductoStock(data) {

    if (data !== undefined) {
        if (_varTablaProductoStock != undefined) { //añadido 03.11.2021
            _varTablaProductoStock.destroy();
        }

        _varTablaProductoStock = $('.datatable-producto-cotizacion').DataTable({
            //_varTablaProducto = $('.datatable-producto').DataTable({
            data: data,
            columns: [
                {
                    width: '16%',
                    data: 'codProdu'
                },
                {
                    width: '9%',
                    data: 'marcaProdu'
                },
                {
                    width: '30%',
                    data: 'descProdu'
                },
                {
                    width: '5%',
                    data: 'UM'
                },
                {
                    width: '10%',
                    data: 'stockFisico'
                },
                {
                    width: '',
                    data: 'stockDispon'
                },
                {
                    width: '',
                    data: 'pedido'
                },
                //{
                //    width: '',
                //    data: 'stockOtr'
                //},
                { data: 'idProdu' },   //8
                //AÑADIDOS  15.10.2021
                { data: 'precio' },
                { data: 'cost' },
                { data: 'msto' },
                { data: 'moneitem' },
                { data: 'aigv' },
            ],
            columnDefs: [
                {
                    targets: [7],
                    visible: false,
                    searchable: false
                },
                {
                    targets: [9],
                    visible: false,
                    searchable: false
                },
                {
                    targets: [10],
                    visible: false,
                    searchable: false
                },
                {
                    targets: [11],
                    visible: false,
                    searchable: false
                },
                {
                    targets: [12],
                    visible: false,
                    searchable: false
                },
            ],
            lengthMenu: [10, 25, 50],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
            select: {
                style: 'single'
            }
        });
    } else {
        _varTablaProductoStock = $('.datatable-producto-cotizacion').DataTable({
            lengthMenu: [10, 25, 50],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
            columnDefs: [
                {
                    targets: [-1],
                    visible: false,
                    searchable: false
                }
            ],
        });

        //7000000
    }
}


///////////////////////////////////////////////////////////////////
//Boton en la tercera division de los Filtros de "Consultar Stock"
///////////////////////////////////////////////////////////////////
$('#btn-search-produ-stock-cotiz').on('click', function () {


    var almacen = $('#cboAlmacen option:selected').val();
    var subLinea = $('#cboSubLinea option:selected').val();
    subLinea = subLinea.replace('-', '');
    var grupo = $('#cboGrupo option:selected').val();
    var estado = $('#estado-produ option:selected').val();
    var descProdu = $('#desc-produ').val();
    var codProdu = $('#cod-produ').val();
    var codProdu = $('#cod-produ').val();//  '';

    var _mone = $('#cboModeda option:selected').val();//"D";
    var _tcam = $('#txt-tipo-cambio').val();//"4.106";


    //Si es dolar y esta vacio
    if (_mone == "D" && _tcam == '') {
        //if (_tcam == '0.00' || _tcam == '') {

        $.ambiance({
            message: "Asigne un tipo de cambio.",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        return;
    }
    //Si es dolar y es 0.00
    if (_mone == "D" && _tcam == '0.00') {
        //if (_tcam == '0.00' || _tcam == '') {

        $.ambiance({
            message: "Asigne un tipo de cambio.",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        $('#txt-tipo-cambio').focus();
        return;
    }

    //AÑADIDO
    if (_mone == "S" && _tcam == '0.00') {

        if (_tcam == '0.00' || _tcam == '0' || _tcam == '') {

            $('#txt-tipo-cambio').val("0.00");
            _tcam = 1;

        }

    }

    //SE MODIFICA PARA LISTAR Y BUSCAR SOLO POR CÓDIGO O DESCRIPCIÓN DEL PRODUCTO
    if (descProdu == '' && codProdu == '') {

        $.ambiance({
            message: "Ingrese el Código o la Descripción del Producto a Consultar",
            title: "Consultar Stock",
            type: "error",
            timeout: 4,
            width: 500
        });
        $('#cod-produ').focus();
        return;
    }


    //var data = $('#mas-menos-filtros-cotiz').data('active');
    //if (data === 'menos') {
    //    estado = $('#estado-produ option:selected').val();
    //    descProdu = $('#desc-produ').val();
    //    codProdu = $('#cod-produ').val();
    //}

    if ( descProdu !== '' || codProdu !== '') {//if ((almacen !== '' && subLinea !== '') || descProdu !== '' || codProdu !== '') {

        $.ajax({
            //url: '/Stock/jsonFiltrarProducto',
            url: '/Cotizacion/jsonFiltrarProductoCotiz',
            type: 'POST',
            data: { codSubFam: subLinea, desGrupo: grupo, codAlmac: almacen, estado: estado, codProdu: codProdu, descProdu: descProdu, tcam: _tcam, mone: _mone },
            beforeSend: function () {
                $.blockUI({
                    css: {
                        border: 'none',
                        padding: '15px',
                        backgroundColor: '#000',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .5,
                        color: '#fff'
                    },
                    message: 'Procesando consulta...'
                });
            },
            success: function (response) {
                if (response.type !== undefined && response.type === 'error')
                    window.location.replace("/Login/LoginNavautil");
                else {
                    if (response.length > 0)
                        _datatableProductoStock(response);
                    //_datatableProducto(response);
                    else
                        _varTablaProductoStock.rows().clear().draw();
                    //_varTablaProducto.rows().clear().draw();
                }
            },
            complete: function () {
                $.unblockUI();
            },
            error: (xhr, status, error) => {
                alert('ERROR ' + xhr.status + ' ' + error);
            }
        });

    }

});


///////////////////////////////////////////////////////////////////
//CARGADO DEL LISTADO DE STOCK A COTIZAR
///////////////////////////////////////////////////////////////////
function _datatableProductoCotiz(data) {

    if (data !== undefined) {

        if (typeof _varTablaProductoCotiz !== 'undefined') {
            _varTablaProductoCotiz.destroy();
        }

        _varTablaProductoCotiz = $('.datatable-producto-cotiz').DataTable({
            data: data,
            columns: [
                {
                    width: '5%',
                    data: 'idProdu'
                }, //Contador de filas añadido 03.11.2021
                { data: 'idProdu' }, //codi o idProdu
                {
                    width: '16%',
                    data: 'codProdu' //
                },
                {
                    width: '9%',
                    data: 'marcaProdu'//
                },
                {
                    width: '30%',
                    data: 'descProdu'//
                },
                {
                    width: '5%', //
                    data: 'UM'
                },
                {
                    width: '',
                    data: 'cantProdu'// pedido
                },
                ////AÑADIDOS  15.10.2021
                { data: 'precio' },
                { data: 'dsctPercent' },
                { data: 'tota' },     //70000
            ],
            columnDefs: [
                {
                    targets: [1],//modificado 03.11.2021
                    visible: false,
                    searchable: false
                },
            ],
            lengthMenu: [10, 25, 50],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
            select: {
                style: 'single'
            }
        });
    } else {
        _varTablaProductoCotiz = $('.datatable-producto-cotiz').DataTable({
            lengthMenu: [10, 25, 50],
            scrollY: '300px',
            scrollX: true,
            scrollCollapse: true,
            language: _tableLanguaje,
            columnDefs: [
                {
                    targets: [1], //modificado 03.11.2021
                    visible: false,
                    searchable: false
                },
            ],
        });
    }

    //$('.datatable-producto-cotiz').on('draw.dt', function () {

    //    //alert('datatable-producto-cotiz');
    //    _varTablaProductoCotiz //_varTablaMoviProducto modificado 03.11.2021
    //        .rows()
    //        .remove()
    //        .draw();

    //   // $('#lbl-detMovi-produ').html('');
    //});
    //añadido 03.11.2021
    _varTablaProductoCotiz.on('order.dt search.dt', function () {
        _varTablaProductoCotiz.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();
}


///////////////////////////////////////////////////////////////////
//AL SELECCIONAR UNA FILA DEL LISTADO DE PRODUCTOS FILTRADOS
///////////////////////////////////////////////////////////////////
$('.datatable-producto-cotizacion tbody').on('click', 'tr', function () {

    //Lo que hace es cambiar en el  html esta fila como  ".selected"


    /**
     
    //alert('.datatable-producto-cotizacion');
    var dataT = _varTablaProductoStock.row(this).data();
    var codProdu  = dataT['idProdu'];
    var codigo    = dataT['codProdu'];
    var onlySales = '';
    var precio = dataT['codProdu'];

    alert("Precio del producto" + dataT['precio']);

    $('#lbl-detMovi-produ').html('del Cód. Producto: <strong>' + codigo + '</strong>');

    *****/



    //MOVIMIENTO NO VA EN COTIZACIONES
    //$.post(
    //    '/Stock/movimientoProducto',
    //    { codProdu: codProdu, chk: onlySales },
    //    (response) => {

    //        //if (response.trim() !== '') {
    //        //    $('#movimiento-produ-table').empty();
    //        //    $('#movimiento-produ-table').html(response);
    //        //    $('#chk-solo-ventas').data('cod-produ', codProdu);
    //        //    _varTablaMoviProducto.destroy();
    //        //    _datatableMoviProducto();
    //        //}

    //    }
    //).fail(function (result) {
    //    alert('ERROR ' + result.status + ' ' + result.statusText);
    //});

});


function roundDosDecimales(num) {
    var m = Number((Math.abs(num) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(num);
}

function redondearDosDecimales(num) {
    return +(Math.round(num + "e+2") + "e-2");
}


$('#btn-prueba').on('click', function () {


   
    $.post(
        '/Cotizacion/getCorrelativoCotizacion',
        {
            //sinparametros
            //strfiltroCombo: "IGV", strSegundoFiltro: ""
        },
        response => {

            alert(response);

        });

    //$.post(
    //    '/Cotizacion/getIgvCotizacion',
    //    {
    //        //sinparametros
    //        strfiltroCombo: "IGV", strSegundoFiltro: ""
    //    },
    //    response => {

    //        alert(response);

    //    });



});




/////////////////////////////////////////////////////////////////////////
//ICONO "MAS" QUE DISPARA MODAL CON LOS DATOS DEL PRODUCTO SELECCIONADO
/////////////////////////////////////////////////////////////////////////
$('#btn-MAS-display-modal-producto-aniadir').on('click', () => {

    //La fila seleccionada
    var data = _varTablaProductoStock.row('.selected').data();

    //Si hay una fila seleccionada
    if (data !== undefined) {

        var _codProdu = data['codProdu'].trim();
        if (_codProdu === '') {
            $.ambiance({
                message: 'Seleccione un registro del "Listado de Stock".',
                title: "Añadir Producto",
                type: "error",
                timeout: 4,
                width: 500
            });
            return;
        }

        var _precio = data.precio;
        var _cost = data.cost;
        var _msto = data.msto;
        var _moneitem = data.moneitem;
        var _aigv = data.aigv;

        $.post(
            '/Cotizacion/getDatosProductoAniadir',
            { codprodu: _codProdu, precioPro: _precio, costPro: _cost, mstoPro: _msto, moneitemPro: _moneitem, aigvPro: _aigv },
            (response) => {
                if (response.trim() !== '') {

                    $('.modal-content-aniadir-producto').empty();
                    $('.modal-content-aniadir-producto').html(response);
                    $('#modal-aniadir-producto').modal('show');
                    $("#txt-cantProdu").focus();
                    document.getElementById("txt-cantProdu").focus();

                }

            }
        ).fail(function (result) {
            alert('ERROR ' + result.status + ' ' + result.statusText);
        });

    } else
        $.ambiance({
            message: 'Seleccione un registro del "Listado de Stock".',
            title: "Añadir Producto",
            type: "error",
            timeout: 4,
            width: 300
        });
});


function roundTresDecimales(value) {
    return Number(Math.round(value + 'e' + 3) + 'e-' + 3);
}
//round(1.005, 2); // 1.01

/////////////////////////////////////////////////////////////////////////
//CONFIRMAR AÑADIR PRODUCTO (DISPARADO DESDE EL MODAL)
/////////////////////////////////////////////////////////////////////////
$('#btn-aniadir-produ-cotizar').on('click', () => {

    //Estos valores son llenados desde un html _partial
    var _idProdu = $('#txt-idProdu').val().trim();
    var _codProducto = $('#txt-codProduct').val().trim();
    var _cantProducto = roundDosDecimales($('#txt-cantProdu').val()).toFixed(2);//.toFixed(2); //toFixed(4)
    //alert(_cantProducto)
    var _descProdu = $('#txt-descProdu').text().trim();
    var _unidMedida = $('#txt-unidMedida').text().trim();
    var _marcaProdu = $('#txt-marcaProdu').text().trim();
    var _nomfamLinea = $('#txt-nomfam').text().trim();
    var _nomsubLinea = $('#txt-nomsub').text().trim();
    var _nomgrupTipo = $('#txt-nomgrup').text().trim();
    var _stkFisico = $('#txt-stkFisico').val().trim();
    var _stkDispon = $('#txt-stkDispon').val().trim();
    var _topeMaximo = $('#txt-stkDispon').val().trim();
    var _dsctPercent = $('#txt-porcentaje-descuento').val().trim();

    //AÑADIDO VIERNES
    var _precio = roundTresDecimales($('#txt-precio').text().trim());
    //alert(_precio);
    var _cost = $('#txt-cost').text().trim();
    var _msto = $('#txt-msto').text().trim();
    var _moneitem = $('#txt-moneitem').text().trim();
    var _aigv = $('#txt-aigv').text().trim();
    var _Percent = (100 - _dsctPercent) / 100
    //var _Igv =  "1.18"; //Pendiente a traerlo
    //var _totnConIgv = roundDosDecimales((_cantProducto * _precio * _Igv) * _Percent
    //Solicitado por Eduardo: Total sin IGV.
    var _totnConIgv = roundDosDecimales((_cantProducto * _precio ) * _Percent)
    var _totaSinIgv = ((_cantProducto * _precio) * _Percent);//roundDosDecimales((_cantProducto * _precio) * _Percent)
    //alert(_totaSinIgv + ' sin igv' )


    //Tope maximo para el listado
    if (listaProductosCotizar.length > 23) {

        $.ambiance({
            message: "La Cotización solo soporta 24 productos como máximo.",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        return;
    }
    //Cuando la cantidad supera el Stock Disponible
    if (parseInt(_cantProducto) > parseInt(_topeMaximo)) {

        //alert(_cantProducto +' '+ _topeMaximo)
        $.ambiance({
            message: "La cantidad seleccionada supera al Stock disponible.",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        return;
    }
    //Cuando el producto no tiene stock
    if (_stkDispon === '0' || _stkDispon === undefined) {

        $.ambiance({
            message: "No existe Stock disponible para el producto seleccionado.",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        return;
    }
    //Asignar una cantidad
    if (_cantProducto === '0' || _cantProducto === undefined || _cantProducto == 0) {

        $.ambiance({
            message: "Asigne una cantidad al producto seleccionado a cotizar .",
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 4,
            width: 500
        });
        $('#txt-cantProdu').focus();
        return;
    }

    //CONSTRUCTOR
    class TT_PRODUCTOS {
        constructor
            (
              _idProdu
            , _codProdu
            , _cantProdu
            , _descProdu
            , _unidMedida
            , _marcaProdu
            , _nomfam
            , _nomsub
            , _nomgrup
            , _stkFisico
            , _stkDispon
            , _dsctPercent
            , _precio
            , _cost
            , _msto
            , _moneitem
            , _aigv
            , _tota
            , _totn

            ) {
            this.idProdu      = _idProdu
            this.codProdu     = _codProdu
            this.cantProdu    = _cantProdu
            this.descProdu    = _descProdu
            this.UM           = _unidMedida
            this.marcaProdu   = _marcaProdu
            this.nomfam       = _nomfam
            this.nomsub       = _nomsub
            this.nomgrup      = _nomgrup
            this.stockFisico  = _stkFisico
            this.stockDispon  = _stkDispon
            this.dsctPercent  = _dsctPercent
            this.precio       = _precio
            this.cost         = _cost
            this.msto         = _msto
            this.moneitem     = _moneitem
            this.aigv         = _aigv
            this.tota         = _tota
            this.totn         = _totn

        }
    }

    //---------------------------------------------------------------------------------------------------
    if (listaProductosCotizar.length == 0) {

        listaProductosCotizar.push(

            new TT_PRODUCTOS(
                  _idProdu
                , _codProducto
                , _cantProducto.toString()
                , _descProdu
                , _unidMedida
                , _marcaProdu
                , _nomfamLinea
                , _nomsubLinea
                , _nomgrupTipo
                , _stkFisico
                , _stkDispon
                , _dsctPercent
                , _precio.toFixed(3)
                , _cost
                , _msto
                , _moneitem
                , _aigv
                 //,_totaSinIgv.toFixed(2) 
                , ((roundDosDecimales(_totaSinIgv)).toFixed(2)).toString()
                //, roundDosDecimales(_totaSinIgv).toString()
                //, _totaSinIgv
                , _totnConIgv
            ));

        //alert('_totaSinIgv ' + _totaSinIgv);


    }
    else {

        if (listaProductosCotizar.find(e => e.idProdu == _idProdu)) {

            let position = listaProductosCotizar.findIndex(e => e.idProdu == _idProdu);

            var primeraCantidad = roundDosDecimales(listaProductosCotizar[position].cantProdu) ;

            if ((roundDosDecimales(primeraCantidad) + roundDosDecimales(_cantProducto)) > roundDosDecimales(_topeMaximo)) {

                $.ambiance({
                    message: 'La cantidad a cotizar no puede ser mayor al Stock Disponible.',
                    title: "Añadir Producto a Cotizar",
                    type: "error",
                    timeout: 5,
                    width: 500
                });

                return;

            }

            else {
                //Eliminar la fila seleccionada
                listaProductosCotizar.splice(position, 1);

                listaProductosCotizar.push(
                    new TT_PRODUCTOS(

                          _idProdu
                        , _codProducto
                        , ((roundDosDecimales(roundDosDecimales(_cantProducto) + primeraCantidad)).toFixed(2)).toString() 
                        , _descProdu
                        , _unidMedida
                        , _marcaProdu
                        , _nomfamLinea
                        , _nomsubLinea
                        , _nomgrupTipo
                        , _stkFisico
                        , _stkDispon
                        , _dsctPercent
                        , _precio.toFixed(3)
                        , _cost
                        , _msto
                        , _moneitem
                        , _aigv
                        //falta arreglar
                        , (roundDosDecimales((((roundDosDecimales(_cantProducto) + primeraCantidad) * _precio) * _Percent)).toFixed(2)).toString()   //_totaSinIgv
                        , _totnConIgv

                    ));

            }


        }
        else {
            //alert('_totaSinIgv '+_totaSinIgv);
            listaProductosCotizar.push(
                new TT_PRODUCTOS(
                    _idProdu
                    , _codProducto
                    , _cantProducto.toString()
                    , _descProdu
                    , _unidMedida
                    , _marcaProdu
                    , _nomfamLinea
                    , _nomsubLinea
                    , _nomgrupTipo
                    , _stkFisico
                    , _stkDispon
                    , _dsctPercent
                    , _precio.toFixed(3)
                    , _cost
                    , _msto
                    , _moneitem
                    , _aigv
                    , ((roundDosDecimales(_totaSinIgv)).toFixed(2)).toString()
                    , _totnConIgv

                ));


        }

    }

    ///////////////////////////////////////////////////////////////////////////////    
    console.log(listaProductosCotizar);
    _datatableProductoCotiz(listaProductosCotizar);
    $('#modal-aniadir-producto').modal('hide');

});

/////////////////////////////////////////////////////////////////////////
//Icono Quitar producto Añadido a la lista .datatable-producto-cotiz
/////////////////////////////////////////////////////////////////////////
$('#btn-remover-producto-cotiz').on('click', () => {

    var data = _varTablaProductoCotiz.row('.selected').data();

    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'No existe ningún item en el "Listado de Productos a Cotizar" para eliminar.',
            title: "Quitar Producto",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }


    if (data !== undefined) {

        var _codProdu = data['codProdu'].trim();
        if (_codProdu === '') {
            $.ambiance({
                message: 'Seleccione el registro que desea quitar del "Listado de Productos a Cotizar".',
                title: "Quitar Producto",
                type: "error",
                timeout: 4,
                width: 500
            });
            return;
        }

        let position = listaProductosCotizar.findIndex(e => e.codProdu == _codProdu);
        listaProductosCotizar.splice(position, 1);
        _datatableProductoCotiz(listaProductosCotizar);

    } else

        $.ambiance({
            message: 'Seleccione el registro que desea quitar del "Listado de Productos a Cotizar".',
            title: "Quitar Producto",
            type: "error",
            timeout: 4,
            width: 300
        });


});



/////////////////////////////////////////////////////////////////////////
//PRE GUARDADO BOTON D PRUEBA ELIMINABLE
/////////////////////////////////////////////////////////////////////////
$('#modal-pre-cuardado-click_eliminable').on('click', () => {

    if (arrayEncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#contend-table-cliente').focus();        
        return;
    }

    var codCliente = EncabezadoCotizacion[0].codCliente ? EncabezadoCotizacion[0].codCliente : ""; //"C03874"/ / 

        $.post(
            '/Cotizacion/getDatosPreGuardado',
            {  strFiltro: codCliente }, 
            (response) => {
                if (response.trim() !== '') {
   
                    $('.modal-content-cotizacion-pre-guardado').empty();
                    $('.modal-content-cotizacion-pre-guardado').html(response);
                    $('#modal-pre-cuardado').modal('show');
                    $('#cbo-transportista').val("00001");
                    $('#cbo-tipo-entrega').val("3");
                }

            }
        ).fail(function (result) {
            alert('ERROR ' + result.status + ' ' + result.statusText);
        });


});




/* ///////////////////////////////////////////////////////////////////////
       BOTON CANCELAR REMOVER TODOS LOS PRODUCTOS A COTIZAR
/////////////////////////////////////////////////////////////////////////*/
$('#btn-productos-cotizacion-CANCELAR').on('click', () => {

    //alert();
    if (listaProductosCotizar.length == 0) {

        $.ambiance({
            message: 'No existe ningún item en el "Listado de Productos a Cotizar".',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }

    else {


        listaProductosCotizar = [];
        _datatableProductoCotiz(listaProductosCotizar);

    }


});



/* ///////////////////////////////////////////////////////////////////////
              BOTON GUARDAR COTIZACION
/////////////////////////////////////////////////////////////////////////*/
$('#btn-cotizacion-grabar-GUARDAR1111').on('click', () => {
    
    //PRODUCTOS A COTIZAR
    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'No existe ningún item en el "Listado de Productos a Cotizar".',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }

    //SELECCIONAR CLIENTE 
    if (EncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#contend-table-cliente').focus();
        return;
    }   
   
    //var today = moment().format('DD/MM/YYYY');

    //COMBO VENDEDOR
    if (      $('#cboVendedorCod option:selected').val() == undefined
           || $('#cboVendedorCod option:selected').val() == "") {

          $.ambiance({
              message: 'Seleccione un Vendedor.',
              title: "Guardar Cotización.",
              type: "error",
              timeout: 5,
              width: 500
        });
          $('#cboVendedorCod').focus();          
          return;

    }
    //COMBO CONDICION
    if (   $('#cboCondicionVenta option:selected').val() == undefined
        || $('#cboCondicionVenta option:selected').val()== "") {

        $.ambiance({
            message: 'Seleccione una Condición de Venta.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });

        $('#cboCondicionVenta').focus(); 
        $('#cboCondicionVenta').click(); 
        return;

    }
    //COMBO MONEDA
    if (    $('#cboModeda option:selected').val() == undefined
         || $('#cboModeda option:selected').val() == "") {

        $.ambiance({
            message: 'Seleccione un tipo de Moneda.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });
        return;

    }


    //https://stackoverflow.com/questions/49027041/how-to-change-sweetalert-button-text
    Swal.fire({
        title: "<h2 style='color:white; font-size: 18px;'>" + 'Guardar Cotización' + "</h2>",
        text: "Está seguro que desea Guardar la Cotización?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ACEPTAR',
        cancelButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {

            //MODAL DE PREGUARDADO
            if (arrayEncabezadoCotizacion.length == 0) {
                $.ambiance({
                    message: 'Seleccionar un cliente del "Listado de Clientes".',
                    title: "Añadir Producto a Cotizar",
                    type: "error",
                    timeout: 5,
                    width: 500
                });
                $('#contend-table-cliente').focus();
                return;
            }

            var _codCliente = EncabezadoCotizacion[0].codCliente ? EncabezadoCotizacion[0].codCliente : ""; //"C03874"/ / 

            $.post(
                '/Cotizacion/getDatosPreGuardado',
                {strFiltro: _codCliente}, //getDatosPreGuardado
                (response) => {
                    if (response.trim() !== '') {

                        $('.modal-content-cotizacion-pre-guardado').empty();
                        $('.modal-content-cotizacion-pre-guardado').html(response);
                        $('#modal-pre-cuardado').modal('show');
                        $('#cbo-transportista').val("00001");
                        $('#cbo-tipo-entrega').val("3");
                    }
                }
            ).fail(function (result) {
                alert('ERROR ' + result.status + ' ' + result.statusText);
            });



            }
        })
    $("#swal2-html-container").css("color", "white"); 

});


/* ///////////////////////////////////////////////////////////////////////
                 BOTON CONFIRMAR GUARDADO
/////////////////////////////////////////////////////////////////////////*/
$('#confirmar-guardado-cotizacion').on('click', () => {
    
    var _ndocu = "";
    var _codcli = EncabezadoCotizacion[0].codCliente;
    var _nomcli = EncabezadoCotizacion[0].nomCliente;
    var _ruccli = EncabezadoCotizacion[0].rucCliente;
    var _atte = "";
    if ($('#cbo-atencion  option:selected').val() != 1000) {
        _atte = $('#cbo-atencion option:selected').text();
    }
    else {
        _atte = $('#txt-ingrese-atencion').val();
    }
    var _nrefe = ""; //vacio
    var _requ = ""; //vacio
    var _mone = $('#cboModeda option:selected').val();
    var _tcam = $('#txt-tipo-cambio').val(); //Tipo de Cambio Pendiente
    var _tota = "200.5";//FOR AL OBJETO // FLOAT
    var _toti = "200.5";///FOR AL OBJETO /FLOAT
    var _totn = "200.5";//FOR AL OBJETO //FLOAT
    var _flag = "0";//Enviar SIEMPRE en Cero
    var _codven = $('#cboVendedorCod option:selected').val();   //OK del combo cond de vendedor 
    var _codcdv = $('#cboCondicionVenta option:selected').val();//OK del combo cond de venta 
    var _cond = ""; //CADENA VACIA
    var _dura = $('#txt-dura-validez').val();//OK Del Input duracion
    var _cOperacion = "Nuevo";// Entra como parametro actualizar    ----> esta dentro del OBJETO
    var _obser = $('#txt-observacion').val();
    var _estado = '0'; //cerp
    var _obsere = '';//Entra como vacio //en el sp se le asigna un texto
    var _word = 0; //INT
    var _obser2 = '';//VACIO
    var _dirent = $('#txt-direccion-empresa').val();
    var _codscc = '';//VACIO

    //OBJETO PARA LA CABECERA
    var objCabeCotizacion = {

        //  fecha      : _fecha      
        //, cdocu      : _cdocu
          ndocu: _ndocu.trim()
        , codcli: _codcli.trim()
        , nomcli: _nomcli.trim()
        , ruccli: _ruccli.trim()
        , atte: _atte.trim()
        , nrefe: _nrefe.trim()
        , requ: _requ.trim()
        , mone: _mone.trim()
        , tcam: _tcam.trim()
        , tota: _tota.trim()
        , toti: _toti.trim()
        , totn: _totn.trim()
        , flag: _flag.trim()
        , codven: _codven.trim()
        , codcdv: _codcdv.trim()
        , cond: _cond.trim()
        //, fven       : _fven
        , dura: _dura.trim()
        , cOperacion: _cOperacion.trim()
        , obser: _obser.trim()
        , estado: _estado.trim()
        , obsere: _obsere.trim()
        , word: _word
        , obser2: _obser2.trim()
        , dirent: _dirent.trim()
        , codscc: _codscc.trim()

    }


    //////////////////////////////////////////////////////////////////

    $.post(
        '/Cotizacion/jsonGrabarCotizacion', //jsonActualizarProducto
        { CabeCotizacion: objCabeCotizacion, DetaCotizacion: listaProductosCotizar },
        (response) => {
            if (response.type !== undefined) {

                $.ambiance({
                    message: response.message,
                    title: "Guardar Cotización",
                    type: response.type,
                    timeout: 4,
                    width: 400
                });

                $('#modal-editar-producto').modal('hide');

                //Swal.fire(
                //    'Guardado!',
                //    'Your file has been deleted.',
                //    'success'
                //)
                //$("#swal2-html-container").css("color", "white");

            }

        }
    ).fail(function (result) {
        alert('ERROR ' + result.status + ' ' + result.statusText);
    });

    ////////////////////////////////////////////////////////////
});


/* ///////////////////////////////////////////////////////////////////////
                 TREs BOTONES PARA GENERR REPORTE
//reporteAdicional //CRYSTAL = "" , PDF = '&pdf=1' , EXCEL = '&excel=1'
/////////////////////////////////////////////////////////////////////////*/
$('#btn-reporte-cotizacion-CRYSTAL').on('click', () => {
    generarReporteCotizacion(''); 
});
$('#btn-reporte-cotizacion-PDF').on('click', () => {
    generarReporteCotizacion('&pdf=1'); 
});
$('#btn-reporte-cotizacion-EXCEL').on('click', () => {
    generarReporteCotizacion('&excel=1'); 
});

/*///////////////////////////////////////////////////////////////////////
  FUNCION GENERAR REPORTES CRYSTAL/PDF/EXCEL(usado por los tres botones)
///////////////////////////////////////////////////////////////////////*/
function generarReporteCotizacion(reporteAdicional) {

    //COMBO VENDEDOR
    if ($('#cboVendedorCod option:selected').val() == undefined
        || $('#cboVendedorCod option:selected').val() == "") {

        $.ambiance({
            message: 'Seleccione un Vendedor.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#cboVendedorCod').focus();
        return;

    }
    //COMBO CONDICION
    if ($('#cboCondicionVenta option:selected').val() == undefined
        || $('#cboCondicionVenta option:selected').val() == "") {

        $.ambiance({
            message: 'Seleccione una Condición de Venta.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });

        $('#cboCondicionVenta').focus();
        $('#cboCondicionVenta').click();
        return;

    }
    //COMBO MONEDA
    if ($('#cboModeda option:selected').val() == undefined
        || $('#cboModeda option:selected').val() == "") {

        $.ambiance({
            message: 'Seleccione un tipo de Moneda.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });
        return;

    }

    //Lista Detalle Vacia
    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'Añadir por lo menos un item al "Listado de Productos a Cotizar".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }
    //Encabezado Vacia
    if (arrayEncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#contend-table-cliente').focus();
        return;
    }

    var _vendedor = $('#cboVendedorCod option:selected').text().trim();
    var _condVenta = $('#cboCondicionVenta option:selected').text().trim();
    var _moneda = $('#cboModeda option:selected').val();
    var _validez = $('#txt-dura-validez').val();

    //OBTENER EL IGV
    $.post(
        '/Cotizacion/getIgvCotizacion',
        {
            //sinparametros
            strfiltroCombo: "IGV", strSegundoFiltro: ""
        },
        response => {

            var valorIgv = response[0].cboDes;
            let SubTotal = 0.0000;

            for (var i = 0; i < listaProductosCotizar.length; i++) {
                SubTotal += roundDosDecimales(listaProductosCotizar[i].tota)
            }

            //VALORES TOTALES CALCULADOS
            var valorSubTotal = SubTotal
            var valorTotal = valorSubTotal * valorIgv;
            var valorTotalIgv = valorTotal - valorSubTotal;

            $.post(
                '/Cotizacion/getCorrelativoCotizacion',
                {
                    //sinparametros
                },
                response => {

                    //alert(response);//001-00030511                    
                    var correOriginal = response.split("-");
                    var correMasUno = parseInt(correOriginal[1]) + 1;
                    var _correlativo = "W"+ correOriginal[0] + "-" + correMasUno.toString().padStart(8, "0"); //Añadir ceros ala iszq

                    ////ENVIO DEL ENCABEZADO Y PIE DE PAGINA
                    //$.ajax({
                    //    type: "POST",
                    //    url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaCabeceraCotiz",
                    //    data: JSON.stringify({ 'listadoCabeceraCotiz': arrayEncabezadoCotizacion, }),
                    //    contentType: "application/json; charset=utf-8",
                    //    dataType: "json",
                    //    success: function () {

                            //ENVIO DEL DETALLE
                            $.ajax({
                                type: "POST",
                                url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaDetalleCotiz",
                                data: JSON.stringify({ 'listadoDetalleCotiz': listaProductosCotizar }),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function () {

                                    filtroDeReporte_ = "Generar_Cotizacion";
                                    window.open('/Rep/Vista/RepGenerarCotizacion.aspx?filtroDeReporte='
                                        + filtroDeReporte_
                                        + '&valorSubTotal=' + roundDosDecimales(valorSubTotal.toFixed(2)).toString()
                                        + '&valorTotalIgv=' + roundDosDecimales(valorTotalIgv.toFixed(2)).toString()
                                        + '&valorTotal=' + roundDosDecimales(valorTotal.toFixed(2)).toString()
                                        + '&vendedor=' + _vendedor
                                        + '&condVenta=' + _condVenta
                                        + '&moneda=' + _moneda
                                        + '&validez=' + _validez
                                        + '&correlativo=' + _correlativo
                                        + reporteAdicional //CRYSTAL = "" , PDF = '&pdf=1' , EXCEL = '&excel=1'
                                    );
                                },
                                failure: function () {
                                    //alert("Failure!");
                                }
                            });


                    //    },
                    //    failure: function () {
                    //        //alert("Failure!");
                    //    }
                    //});



                });


        });


};


/*///////////////////////////////////////////////////////////////////////
              GENERAR COTIZACION  -  REPORTE CRYSTAL (No Usado)
///////////////////////////////////////////////////////////////////////*/
$('#btn-reporte-cotizacion-CRYSTAL_o').on('click', () => {

       //COMBO VENDEDOR
    if (      $('#cboVendedorCod option:selected').val() == undefined
           || $('#cboVendedorCod option:selected').val() == "") {

          $.ambiance({
              message: 'Seleccione un Vendedor.',
              title: "Guardar Cotización.",
              type: "error",
              timeout: 5,
              width: 500
        });
          $('#cboVendedorCod').focus();          
          return;

    }
        //COMBO CONDICION
    if (   $('#cboCondicionVenta option:selected').val() == undefined
        || $('#cboCondicionVenta option:selected').val()== "") {

        $.ambiance({
            message: 'Seleccione una Condición de Venta.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });

        $('#cboCondicionVenta').focus(); 
        $('#cboCondicionVenta').click(); 
        return;

    }
    //COMBO MONEDA
    if ($('#cboModeda option:selected').val() == undefined
        || $('#cboModeda option:selected').val() == "") {

        $.ambiance({
            message: 'Seleccione un tipo de Moneda.',
            title: "Guardar Cotización.",
            type: "error",
            timeout: 5,
            width: 500
        });
        return;

    }


    //Lista Detalle Vacia
    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'Añadir por lo menos un item al "Listado de Productos a Cotizar".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }
    //Encabezado Vacia
    if (arrayEncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#contend-table-cliente').focus();
        return;
    }


    var _vendedor  = $('#cboVendedorCod option:selected').text().trim();
    var _condVenta = $('#cboCondicionVenta option:selected').text().trim();
    var _moneda    = $('#cboModeda option:selected').val() 
    var _validez   = $('#txt-dura-validez').val() 
     


    //OBTENER EL IGV
    $.post(
        '/Cotizacion/getIgvCotizacion',
        {
            //sinparametros
            strfiltroCombo: "IGV", strSegundoFiltro: ""
        },
        response => {

            var valorIgv = response[0].cboDes;
            let SubTotal = 0.0000;

            for (var i = 0; i < listaProductosCotizar.length; i++) {
                SubTotal += roundDosDecimales(listaProductosCotizar[i].tota)              
            }
           
            //VALORES TOTALES CALCULADOS
            var valorSubTotal = SubTotal             
            var valorTotal    = valorSubTotal * valorIgv;
            var valorTotalIgv = valorTotal - valorSubTotal;


            $.post(
                '/Cotizacion/getCorrelativoCotizacion',
                {
                    //sinparametros
                },
                response => {

                    //alert(response);//001-00030511                    
                    var correOriginal = response.split("-");
                    var correMasUno   = parseInt(correOriginal[1]) + 1;
                    var _correlativo  = correOriginal[0] + "-" + correMasUno.toString().padStart(8, "0"); //Añadir ceros ala iszq

                    //ENVIO DEL ENCABEZADO Y PIE DE PAGINA
                    $.ajax({
                        type: "POST",
                        url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaCabeceraCotiz",
                        data: JSON.stringify({ 'listadoCabeceraCotiz': arrayEncabezadoCotizacion, }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function () {

                            //ENVIO DEL DETALLE
                            $.ajax({
                                type: "POST",
                                url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaDetalleCotiz",
                                data: JSON.stringify({ 'listadoDetalleCotiz': listaProductosCotizar }),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function () {

                                    filtroDeReporte_ = "Generar_Cotizacion";
                                    window.open('/Rep/Vista/RepGenerarCotizacion.aspx?filtroDeReporte='
                                        + filtroDeReporte_
                                        + '&valorSubTotal=' + roundDosDecimales(valorSubTotal.toFixed(2)).toString()//.toFixed(2)
                                        + '&valorTotalIgv=' + roundDosDecimales(valorTotalIgv.toFixed(2)).toString()
                                        + '&valorTotal=' + roundDosDecimales(valorTotal.toFixed(2)).toString()
                                        + '&vendedor=' + _vendedor
                                        + '&condVenta=' + _condVenta
                                        + '&moneda=' + _moneda
                                        + '&validez=' + _validez
                                        + '&correlativo=' + _correlativo
                                        + '' //CRYSTAL = "" , PDF = '&pdf=1' , EXCEL = '&excel=1'
                                    );
                                },
                                failure: function () {
                                    //alert("Failure!");
                                }
                            });


                        },
                        failure: function () {
                            //alert("Failure!");
                        }
                    });



                });


        });


});

/* //////////////////////////////////////////////////////////////////////
              GENERAR COTIZACION  -  REPORTE PDF (No Usado)
///////////////////////////////////////////////////////////////////////*/
$('#btn-reporte-cotizacion-PDF_o').on('click', () => {

    //alert(arrayEncabezadoCotizacion.length );
    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'Añadir por lo menos un item al "Listado de Productos a Cotizar".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }

    if (arrayEncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });
        $('#contend-table-cliente').focus();
        return;
    }

    //ENVIO DEL ENCABEZADO Y PIE DE PAGINA
    $.ajax({
        type: "POST",
        url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaCabeceraCotiz",
        data: JSON.stringify({ 'listadoCabeceraCotiz': arrayEncabezadoCotizacion }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {

            //ENVIO DEL DETALLE
            $.ajax({
                type: "POST",
                url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaDetalleCotiz",
                data: JSON.stringify({ 'listadoDetalleCotiz': listaProductosCotizar }), ///
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {

                    filtroDeReporte_ = "Generar_Cotizacion";
                    window.open('/Rep/Vista/RepGenerarCotizacion.aspx?filtroDeReporte=' + filtroDeReporte_ + '&pdf=1');
                },
                failure: function () {
                    //alert("Failure!");
                }
            });


        },
        failure: function () {
            //alert("Failure!");
        }
    });


});

/* //////////////////////////////////////////////////////////////////////
              GENERAR COTIZACION  -  REPORTE EXCEL (No Usado)
///////////////////////////////////////////////////////////////////////*/
$('#btn-reporte-cotizacion-EXCEL_o').on('click', () => {

    //alert(arrayEncabezadoCotizacion.length );
    if (listaProductosCotizar.length == 0) {
        $.ambiance({
            message: 'Añadir por lo menos un item al "Listado de Productos a Cotizar".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }

    if (arrayEncabezadoCotizacion.length == 0) {
        $.ambiance({
            message: 'Seleccionar un cliente del "Listado de Clientes".',
            title: "Añadir Producto a Cotizar",
            type: "error",
            timeout: 5,
            width: 500
        });

        return;
    }

    //ENVIO DEL ENCABEZADO Y PIE DE PAGINA
    $.ajax({
        type: "POST",
        url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaCabeceraCotiz",
        data: JSON.stringify({ 'listadoCabeceraCotiz': arrayEncabezadoCotizacion }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {

            //ENVIO DEL DETALLE
            $.ajax({
                type: "POST",
                url: "/Rep/Vista/RepGenerarCotizacion.aspx/ListaDetalleCotiz",
                data: JSON.stringify({ 'listadoDetalleCotiz': listaProductosCotizar }), ///
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {

                    filtroDeReporte_ = "Generar_Cotizacion";
                    window.open('/Rep/Vista/RepGenerarCotizacion.aspx?filtroDeReporte=' + filtroDeReporte_ + '&excel=1');

                },
                failure: function () {
                    //alert("Failure!");
                }
            });


        },
        failure: function () {
            //alert("Failure!");
        }
    });


});














//////////REPORTE RESUMEN DE DASHBOARD CRYSTAL
//////////////////////////////////////////////////////////////////////////
////////$('#btn-generar-report-resumen-dashboard-crystal-SAF').on('click', function () {
////////    $.ajax({
////////        type: "POST",
////////        url: "/Rep/Vista/RepVentanaPrincipal.aspx/ListaJSDashboard",
////////        data: JSON.stringify({ 'listadoVentanaPricipal': arrayEncabezadoCrystal }), 
////////        contentType: "application/json; charset=utf-8",
////////        dataType: "json",
////////        success: function () {
////////            //filtroDeReporte = "ReporteResumenDeDashboard"
////////            //window.open('/Rep/Vista/RepVentanaPrincipal.aspx?filtroDeReporte=' + filtroDeReporte + '&zoomLevel=' + '80' + '');
////////        },
////////        failure: function () {
////////            //alert("Failure!");
////////        }
////////    });
////////});

///////////////////////////////////////////////////////////////
//YA NO SE USA
///////////////////////////////////////////////////////////////
/**/
function detalleComprobanteCotiz(id, nro) {

    $('#lbl-detComp-cliente').html('<strong> Nº: ' + nro + '</strong>');

    var date_Start = $('#date_1').val();
    var date_End = $('#date_2').val();

    $.post(
        '/Cotizacion/DetalleComprobante',
        { id: id, fechaIni: date_Start, fechaFin: date_End },
        (response) => {
            if (response.trim() !== '') {
                $('#contend-comprobante').empty();
                $('#contend-comprobante').html(response);
                _varTablaDetalleComprobanteCotiz.destroy();
                _datatableDetalleComprobanteCotiz();
            }

        }
    ).fail(function (result) {
        alert('ERROR ' + result.status + ' ' + result.statusText);
    });
}

var _varTablaDetalleComprobanteCotiz;
function _datatableDetalleComprobanteCotiz() {
    _varTablaDetalleComprobanteCotiz = $('.datatable-comprob-cliente-cotiz').DataTable({
        lengthMenu: [10, 25, 50],
        responsive: true,
        order: [[0, 'asc']],
        language: _tableLanguaje,
    });
}


//#endregion COTIZACION