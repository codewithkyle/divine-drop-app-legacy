/**
 * @see https://scryfall.com/docs/api/colors
 */
function updateCardText() {
	const textElements = document.body.querySelectorAll("card-text:not([updated])");
	textElements.forEach((el: HTMLElement) => {
		el.setAttribute("updated", "true");
		const raw = el.innerHTML;
		const updated = raw
			.replace(
				/\{B\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/B.svg" alt="Black mana symbol" title="Black mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(/\{R\}/g, `<img width="14" loading="lazy" src="/images/symbols/R.svg" alt="Red mana symbol" title="Red mana" style="width:14px;height:14px;display:inline-block;">`)
			.replace(
				/\{U\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/U.svg" alt="Blue mana symbol" title="Blue mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{W\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/W.svg" alt="White mana symbol" title="White mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{G\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/G.svg" alt="Green mana symbol" title="Green mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{S\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/S.svg" alt="Snow mana symbol" title="Snow mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(/\{T\}/g, `<img width="14" loading="lazy" src="/images/symbols/T.svg" alt="Tap symbol" title="Tap" style="width:14px;height:14px;display:inline-block;">`)
			.replace(/\{Q\}/g, `<img width="14" loading="lazy" src="/images/symbols/Q.svg" alt="Untap symbol" title="Untap" style="width:14px;height:14px;display:inline-block;">`)
			.replace(
				/\{CHAOS\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/CHAOS.svg" alt="Chaos symbol" title="Chaos" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{X\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/X.svg" alt="X generic mana symbol" title="X generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{Y\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/Y.svg" alt="Y generic mana symbol" title="Y generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{Z\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/Z.svg" alt="Z generic mana symbol" title="Z gerneric mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{\0\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/0.svg" alt="Zero mana symbol" title="Zero mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{1\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/1.svg" alt="1 generic mana symbol" title="1 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2.svg" alt="2 generic mana symbol" title="2 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{3\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/3.svg" alt="3 generic mana symbol" title="3 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{4\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/4.svg" alt="4 generic mana symbol" title="4 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{5\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/5.svg" alt="5 generic mana symbol" title="5 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{6\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/6.svg" alt="6 generic mana symbol" title="6 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{7\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/7.svg" alt="7 generic mana symbol" title="7 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{8\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/8.svg" alt="8 generic mana symbol" title="8 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{9\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/9.svg" alt="9 generic mana symbol" title="9 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{10\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/10.svg" alt="10 generic mana symbol" title="10 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{11\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/11.svg" alt="11 generic mana symbol" title="11 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{12\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/12.svg" alt="12 generic mana symbol" title="12 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{13\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/13.svg" alt="13 generic mana symbol" title="13 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{14\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/14.svg" alt="14 generic mana symbol" title="14 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{15\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/15.svg" alt="15 generic mana symbol" title="15 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{16\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/16.svg" alt="16 generic mana symbol" title="16 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{17\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/17.svg" alt="17 generic mana symbol" title="17 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{18\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/18.svg" alt="18 generic mana symbol" title="18 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{19\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/19.svg" alt="19 generic mana symbol" title="19 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{20\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/20.svg" alt="20 generic mana symbol" title="20 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{B\/G\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/BG.svg" alt="One blue one green mana symbol" title="Blue green mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{B\/R\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/BR.svg" alt="One blue one red mana symbol" title="Blue red mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{G\/U\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/GU.svg" alt="One green one blue mana symbol" title="Green blue mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{G\/W\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/GW.svg" alt="One green one white mana symbol" title="Green white mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{R\/G\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/RG.svg" alt="One red one green mana symbol" title="Red green mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{R\/W\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/RW.svg" alt="One red one white mana symbol" title="Red white mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{U\/B\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/UB.svg" alt="One blue one black mana symbol" title="Blue black mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{U\/R\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/UR.svg" alt="One blue one red mana symbol" title="Blue red mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{W\/B\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/WB.svg" alt="One white one black mana symbol" title="White black mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{W\/U\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/WU.svg" alt="One white one blue mana symbol" title="White blue mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\/B\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2B.svg" alt="Two black mana symbol" title="Two black mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\/G\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2G.svg" alt="Two green mana symbol" title="Two green mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\/R\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2R.svg" alt="Two red mana symbol" title="Two red mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\/U\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2U.svg" alt="Two blue mana symbol" title="Two blue mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{2\/W\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/2W.svg" alt="Two white mana symbol" title="Two white mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{B\/P\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/BP.svg" alt="One black or two life mana symbol" title="One black mana or two life" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{R\/P\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/RP.svg" alt="One red or two life mana symbol" title="One red mana or two life" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{G\/P\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/GP.svg" alt="One green or two life mana symbol" title="One green mana or two life" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{U\/P\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/UP.svg" alt="One blue or two life mana symbol" title="One blue mana or two life" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{W\/P\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/WP.svg" alt="One white or two life mana symbol" title="One white mana or two life" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{100\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/100.svg" alt="100 generic mana symbol" title="100 generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{1000000\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/MILLION.svg" alt="One million generic mana symbol" title="One million generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{\∞\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/UNLIMITED.svg" alt="Infinite generic mana symbol" title="Infinite generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{\½\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/HALF.svg" alt="One-half generic mana symbol" title="One-half generic mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{HW\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/HW.svg" alt="One-half white mana symbol" title="One-half white mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{HR\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/HR.svg" alt="One-half red mana symbol" title="One-half red mana" style="width:14px;height:14px;display:inline-block;">`
			)
			.replace(
				/\{C\}/g,
				`<img width="14" loading="lazy" src="/images/symbols/C.svg" alt="One colorless mana symbol" title="One colorless mana" style="width:14px;height:14px;display:inline-block;">`
			);
		el.innerHTML = updated;
	});
}
setInterval(updateCardText, 500);
