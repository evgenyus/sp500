let hash = {};
let cpi = {};
(function() {
	$.when(
		$.get('sptr.csv').done(data => {
			data = data.split(/\r?\n/);
			for (let c of data) {
				let date = c.split(',')[0];
				let value = c.split(',')[1];
				let key = +date.split('/')[0] + '/' + date.split('/')[2];
				let month = +date.split('/')[0];
				if (month === 1 || month === 4 || month === 7 || month === 10) {
					hash[key] = value;
				}
			}
		}),
		$.get('cpi.csv').done(data => {
			data = data.split(/\r?\n/);
			for (let c of data) {
				let date = c.split(',')[0];
				let value = c.split(',')[1];
				let key = +date.split('-')[1] + '/' + date.split('-')[0];
				let month = +date.split('-')[1];
				if (month === 1 || month === 4 || month === 7 || month === 10) {
					cpi[key] = value;
				}
			}
		})
	).then(function(){
		let $row;
		for (let y = 1988; y <= 2016; y++) {
			for (let m = 1; m <= 12; m += 3) {
				let basePrice = 0,
					periods = 0;
				$row = $('<div class="row"></div>');
				for (let yy = 1988; yy <= 2016; yy++) {
					for (let mm = 1; mm <= 12; mm += 3) {
						let totalReturn = 0,
							ret = 0,
							adjRet = 0,
							cpiDiff = 0,
							className = '';
							
						if (yy > y || (yy === y && mm >= m)) {
							let date = `${mm}/${yy}`;
							let price = hash[date];

							periods++;
							if (basePrice === 0) {
								basePrice = price;
							}
							
							totalReturn = price / basePrice;
							cpiDiff = cpi[date] / cpi[`${m}/${y}`];
							ret = Math.pow(totalReturn / cpiDiff, 4/periods);
						}

						$row.append(`<div class='cell ${className}'
								data-buy='${m}/${y}'
								data-sell='${mm}/${yy}'
								data-return='${ret}'
							</div>`);
					}
				}
				if (m === 1 && y % 2 === 0) {
					$('#sp500').append(`<span class='year'>${y}</span>`);
					$('#hor-legend').append(`<span>${y}</span>`);
				}
				$('#sp500').append($row);
			}
		}

		$('#sp500').on('mouseenter', '.cell:not(.empty)', e => {
			let $cell = $(e.target);
			let text = '';

			if ($cell.attr('data-return') !== '0') {
				text = `From ${$cell.attr('data-buy')} to ${$cell.attr('data-sell')}<br>
					CPI-Adjusted Return ${(100*(+$cell.attr('data-return')-1)).toFixed(1)}%`;
			}
			
			$('#legend').html(text);
		});
	})
})();