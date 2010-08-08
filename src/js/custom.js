var Bup = {
	getDirectory: function (path) {
		if (Bup_Data && Bup_Data.directories) {
			return Bup_Data.directories[path];
		}
	},

	renderDirectory: function (directory_path, active_path) {
		var directory = this.getDirectory(directory_path);
		if (Bup_Data && Bup_Data.fs) {
			var result = '<table cellspacing="0"><thead><tr><th>Filetype</th><th>Size</th></tr></thead><tbody>';
			$(directory).each(function() {
				if (Bup_Data.fs[this]) {
					var name_array = this.split('/');
					var name = name_array[name_array.length-1];

					var type = Bup_Data.fs[this].type;

					if (type == 'directory') {
						result += '<tr class="directory' + ((active_path == this) ? ' active' : '') + '"><td><a href="#" data-path="' + this + '">' + name + '</a></td><td>&nbsp;</td>';
					} else if (type == 'file') {
						result += '<tr class="file"><td><a href="#" data-path="' + this + '">' + name + '</a></td><td>' + Bup_Data.fs[this].size + '</td>';
					}
				}
			});
			result += '</tbody> </table>';
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

			var result = '<table cellspacing="0"><thead><tr><th colspan="2">' + name +'</th></tr></thead><tbody>';
			if (size) {
				result += '<tr><th>Size</th><td>' + size + '</td></tr>';
			}
			if (permissions) {
				result += '<tr><th>Permissions</th><td>' + permissions + '</td></tr>';
			}
			if (filetype) {
				result += '<tr><th>Filetype</th><td>' + filetype + '</td></tr>';
			}
			result += '<tr><td colspan="2"><a href="#">Open file</a></tr>';
			result += '</tbody></table>';
			return result;
		}
	},

	showDirectory: function (directory_path) {
		// clear shown file
		$('#col3').html('&nbsp;');

		var path_array = directory_path.split('/');
		if (directory_path == '/') {
			$('#col1').html('&nbsp;');
		} else if (path_array.length == 2) {
			$('#col1').html(this.renderDirectory('/', directory_path));
		} else {
			path_array.pop();
			$('#col1').html(this.renderDirectory(path_array.join('/', directory_path)));
		}
		$('#col2').html(this.renderDirectory(directory_path, ''));
		$('#breadcrumb').html(this.renderBreadcrumb(directory_path));
	},

	showFile: function (file_path) {
		var path_array = file_path.split('/');
		path_array.pop();
		if (path_array.length > 1) {
			$('#col2').html(this.renderDirectory(path_array.join('/'), path_array.join('/')));

			path_array.pop();
			if (path_array.length > 1) {
				$('#col1').html(this.renderDirectory(path_array.join('/'), path_array.join('/')));
			}
		} else {
			$('#col2').html(this.renderDirectory('/', ''));
		}
		$('#col3').html(this.renderFile(file_path));
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
	}
}

$(function () {
	$('#col2').html(Bup.renderDirectory('/', ''));
	Bup.showDirectory('/');

	$('#col1 .directory a, #col2 .directory a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showDirectory(path);
		return false;
	});

	$('#col2 .file a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showFile(path);
		return false;
	});

	$('#breadcrumb a').live('click', function() {
		var path = $(this).attr('data-path');
		Bup.showDirectory(path);
	});
});
