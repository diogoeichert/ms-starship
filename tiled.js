/*
 * core2d-format.js
 *
 * This extension adds the 'core2d map format' type to the Export As menu,
 * which can be used to generate matrix maps as used by the Scene.build()
 * method from the core2d library (https://github.com/diogoeichert/core2d)
 */

/* global tiled, FileInfo, TextFile */

tiled.registerMapFormat("core2d", {
	name: "starship scrolling format",
	extension: "json",

	write: (map, fileName) => {
		for (let i = 0; i < map.layerCount; ++i) {
			const layer = map.layerAt(i);

			if (!layer.isTileLayer) {
				continue;
			}

			var file = new TextFile(fileName, TextFile.WriteOnly);
			file.writeLine("[");

			for (let x = 0; x < layer.width; ++x) {
				const row = [];

				for (let y = layer.height - 1; y > -1 ; --y) {
					const tile = layer.tileAt(x, y);
					let id = "  ";

					if (tile) {
						id = FileInfo.baseName(tile.imageFileName);
					}

					row.push(`"${id}"`);
				}

				file.writeLine("\t[" + row.join(", ") + "],");
			}

			file.writeLine("]");
			file.commit();
		}
	},
});
