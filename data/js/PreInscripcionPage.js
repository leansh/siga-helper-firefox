var PreInscripcionPage = function(utils) {

	var getAllHoursUsed = function($table) {
		var getTurnIndex = function(turn) {
			if (turn == "m") {
				return 0;
			} else if (turn == "t") {
				return 1;
			} else if (turn == "n") {
				return 2;
			}
			return 0;
		};

		var hoursUsed = {};

		$table.find("tbody tr").each(function(){
			var $tdAlternates = $(this).find("td:not(:first)");
			
			if ($tdAlternates.length) {
				var subjectCode = $(this).find("td:first").text().match(/\[(.*?)\]/)[1];

				$tdAlternates.each(function(alternateIndex) {
					if (!$(this).hasClass("soft-back")) {
						var strArray = utils.getTextNodes($(this));
						if (!strArray.length) {
							strArray = utils.getTextNodes($(this).find("a"));
						}

						if (strArray.length) {
							var str = strArray[0].replace("CAMPUS", "").replace("MEDRANO", ""); // This is not necessary, but just in case.

							utils.getSchedulesFromString(str).forEach(function(schedule) {
								var firstHour = parseInt(schedule.firstHour) + (getTurnIndex(schedule.turn) * 7);
								var lastHour = parseInt(schedule.lastHour) + (getTurnIndex(schedule.turn) * 7);

								if (!hoursUsed[alternateIndex]) {
									hoursUsed[alternateIndex] = {};
								}

								if (!hoursUsed[alternateIndex][schedule.day]) {
									hoursUsed[alternateIndex][schedule.day] = {};
								}

								for (var i = firstHour; i <= lastHour; i++) {
									hoursUsed[alternateIndex][schedule.day][i] = subjectCode;
								}
							});
						}
					}
				});
			}
		});

		return hoursUsed;
	};

	var setPreviewTable = function(hoursUsed) {
		var $divContainer = $("<div style='display: inline-block;'>");

		for (var alternateIndex in hoursUsed) {
			var $table = $("<table>");
			var $tbody = $("<tbody>");

			$table.append($tbody);
			$tbody.append('<tr><th></th><th colspan="7">Mañana</th><th colspan="7">Tarde</th><th colspan="7">Noche</th></tr>');

			for (var day in utils.days) {
				var $tr = $("<tr>");
				$tr.append($("<td>", { html: utils.days[day] }));

				for (var i = 0; i <= 19; i++) {
					var subjectCode = hoursUsed[alternateIndex][day] ? hoursUsed[alternateIndex][day][i] : "";
					if (subjectCode) {
						subjectCode = "#" + subjectCode.split("").reverse().join("");
					} else {
						subjectCode = "transparent";
					}
					$tr.append($("<td>", { style: "background-color:" + subjectCode, html: "&nbsp;" }));
				}
				$tbody.append($tr);
			}

			var $p = $("<p>", { html: "Preview de cursada (Alt " + (parseInt(alternateIndex) + 1) + ")" });
			var $divTable = $("<div>").append($table);
			$divContainer.append($p);
			$divContainer.append($divTable);
			$divContainer.append("<span class='powered-by-siga-helper'></span>");
		}
		$(".std-canvas table:last").parent().after($divContainer);
	};

	(function() {
		var $table = $(".std-canvas table:last");
		var $th = $table.find("tr:first > th:first");

		// Check used to be sure that the given table is the one that has the used hours
		if ($th.length && $th.text() == "") {
			var hoursUsed = getAllHoursUsed($table);
			setPreviewTable(hoursUsed);
		}
	})();


	// Public
	return {};
};