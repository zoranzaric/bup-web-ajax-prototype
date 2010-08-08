var Bup = {
	templates : {
		file :
			'<div id="{{file_path}}" class="file_wrapper">'
			+ '<table cellspacing="0">'
			+ '<thead><tr><th colspan="2">{{name}}</th></tr></thead>' 
			+ '<tbody>'

			+ '{{#size}}'
			+ 	'<tr><th>Size</th><td>{{size}}</td></tr>'
			+ '{{/size}}'

			+ '{{#permissions}}'
			+ 	'<tr><th>Permissions</th><td>{{permissions}}</td></tr>'
			+ '{{/permissions}}'

			+ '{{#filetype}}'
			+ 	'<tr><th>Filetype</th><td>{{filetype}}</td></tr>'
			+ '{{/filetype}}'

			+ '<tr><td colspan="2"><a href="#">Open file</a></tr>'
			+ '</tbody></table></div>'
	},

	getDirectory: function (path) {
		if (Bup_Data && Bup_Data.directories) {
			return Bup_Data.directories[path];
		}
	},

	renderDirectory: function (directory_path) {
		var directory = this.getDirectory(directory_path);
		if (Bup_Data && Bup_Data.fs) {
			var margin_left = ((directory_path.split('/').length - 1) * 501);
			var result = '<div id="' + directory_path + '" class="directory_wrapper"><table cellspacing="0"><thead><tr><th>Filetype</th><th>Size</th></tr></thead><tbody>';
			$(directory).each(function() {
				if (Bup_Data.fs[this]) {
					var name_array = this.split('/');
					var name = name_array[name_array.length-1];

					var type = Bup_Data.fs[this].type;

					if (type == 'directory') {
						result += '<tr class="directory"><td><a href="#" data-path="' + this + '">' + name + '</a></td><td>&nbsp;</td>';
					} else if (type == 'file') {
						result += '<tr class="file"><td><a href="#" data-path="' + this + '">' + name + '</a></td><td>' + Bup_Data.fs[this].size + '</td>';
					}
				}
			});
			result += '</tbody></table></div>';
			return result;
		}
	},

	renderFile: function (file_path) {
		if (Bup_Data && Bup_Data.fs) {
			var file = Bup_Data.fs[file_path];

			var name = file_path.split("/").pop();
			var size = (file.size) ? file.size : '';
			var permissions = (file.permissions) ? file.permissions : '';
			var filetype = (file.filetype) ? file.filetype : '';

			var file_data = {
				'file_path' : file_path,
				'name' : name,
				'size' : size,
				'permissions' : permissions,
				'filetype' : filetype
			}
			return Mustache.to_html(this.templates.file, file_data);
		}
	},

	showDirectory: function (directory_path) {
		$('#directories').children().each(function () {
			var id = $(this).attr('id');
			if (id != 'clearing') {
				if (!directory_path.match('^' + id) || directory_path == id) {
					$(this).remove();
				}
			}
		});

		$('#directories #clearing').before(this.renderDirectory(directory_path));
		this.resizeDirectories();

		$('#breadcrumb').html(this.renderBreadcrumb(directory_path));
		this.highlightPath(directory_path);
	},

	resizeDirectories: function () {
		var max_height = 0;
		var directories = $('#directories');
		directories.children().each(function () {
			if ($(this).height() > max_height) {
				max_height = $(this).height();
			}
		});
		directories.children().each(function () {
			if ($(this).attr('id') != 'clearing') {
				$(this).height(max_height);
			}
		});
		directories.height(max_height);
		directories.width((directories.children().length - 1) * 501);
	},

	showFile: function (file_path) {
		var path_array = file_path.split('/');
		path_array.pop();
		$('#directories #clearing').before($(this.renderFile(file_path)));

		this.resizeDirectories();
		this.highlightPath(file_path);
	},

	renderBreadcrumb: function (path) {
		var path_array = path.split('/');
		var html = '<a href="#" data-path="/">[root]</a>';
		for (var i=1; i<path_array.length-1; i++) {
			var subpath = '';
			for (var j=1; j<=i; j++) {
				subpath += '/' + path_array[j];
			}
			html += ' / <a href="#" data-path="' + subpath + '">' + path_array[i] + '</a>';
		}
		html += ' / <strong>' + path_array[path_array.length-1] + '</strong>';
		return html;
	},

	highlightPath: function (path) {
		$('#directories').children().each(function () {
			var id = $(this).attr('id');
			if (id != 'clearing') {
				$(this).find('tbody tr').each(function () {
					var currentpath = $(this).find('a').attr('data-path');
					if (path.match('^' + currentpath)) {
						$(this).addClass('active');
					} else {
						$(this).removeClass('active');
					}
				});
			}
		});
	}
}

$(function () {
	Bup.showDirectory('/');

	$('#directories .directory a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showDirectory(path);
		return false;
	});

	$('#directories .file a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showFile(path);
		return false;
	});

	$('#breadcrumb a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showDirectory(path);
	});
});
