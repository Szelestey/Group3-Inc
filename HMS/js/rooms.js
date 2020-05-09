$(document).ready(function() {

  var modifyRoomModal = $('#modifyRoomModal');

  modifyRoomModal.on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var roomtype = button.data('roomtype');
    var modal = $(this);
    modal.find('#roomtypeLabel').text(roomtype);

    window.localStorage.setItem('currType', roomtype);

    var typeData = JSON.parse(window.localStorage.getItem(roomtype));

    $('#currentName').text(typeData.type_name);
    $('#currentPrice').text(typeData.type_base_price);
    $('#currentDescription').text(typeData.type_description);
    $('#changeSubmit').val(roomtype);
  });

  modifyRoomModal.on('hidden.bs.modal', function(event) {
    $(this).find("input").val('').end();
    $(this).find("textarea").val("");
    $('#roomtypeLabel').text('');
  });

  getAllRoomTypeInfoAndPopulateTable();
});


function populateRoomtypeTable() {
  var types = JSON.parse(window.localStorage.getItem('types'));

  var html = '';
  types.forEach(type => {
    var typeData = JSON.parse(window.localStorage.getItem(type))
    html += buildRoomsTableRow(typeData);
  });

  var tbody = $('#roomsTable').find('tbody');
  tbody.empty();
  tbody.append(html);
}


function buildRoomsTableRow(data) {
  return '<tr>'
      + '<td class="text-center">'+data.type_id+'</td>'
      + '<td class="text-center">'+data.type_name+'</td>'
      + '<td class="text-center">$ '+data.type_base_price+'</td>'
      + '<td>'+data.type_description+'</td>'
      + '<td class="text-center">'+data.numInService+'</td>'
      + '<td class="text-center"><button class="btn btn-primary" data-toggle="modal" data-target="#modifyRoomModal" data-roomtype="'+data.type_id+'">Modify</button></td>'
      + '</tr>';
}


function getAllRoomTypeInfoAndPopulateTable() {
  var url = baseApiUrl + '/rooms/';
  sendGetWithCreds(url).then((data, status, jqXHR) => {
    var types = [];
    data.forEach(type => {
      window.localStorage.setItem(type.type_id, JSON.stringify(type));
      types.push(type.type_id);
    });
    window.localStorage.setItem('types', JSON.stringify(types));
    populateRoomtypeTable();
  })
  .fail(data => {
    console.log("failed");
  });
}


function modifyRoom() {
  var type = $('#changeSubmit').val();

  var newName = $('#newName').val();
  var newPrice = $('#newPrice').val();
  var newDescription = $('#newDescription').val();

  newName = (newName) ? newName : $('#currentName').text();
  newPrice = (newPrice) ? newPrice : $('#currentPrice').text();
  newDescription = (newDescription) ? newDescription : $('#currentDescription').text();

  var changeData = {
    type: type,
    name: newName,
    price: newPrice,
    description: newDescription
  };
  var url = baseApiUrl + '/rooms/';

  sendPostWithCreds(url, changeData).then((data, status) => {
    getAllRoomTypeInfoAndPopulateTable();
    $('#modifyRoomModal').modal('hide');
  })
  .fail(data => {
    console.log("failed");
  });

}

