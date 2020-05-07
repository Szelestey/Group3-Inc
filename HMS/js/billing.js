$(document).ready(function() {

  let paymentModal = $('#makePaymentModal');

  // Show modal event for changePassword
  paymentModal.on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var invoiceId = button.data('inv');
    var name = button.data('name');
    var modal = $(this);
    modal.find('#modalTitleId').text(name + "    " + invoiceId);
  });

})
