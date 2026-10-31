// Markdown tables render header cells as bare <th>; give them scope="col" so
// screen readers tie each column header to its cells (melta UI TABLE_TH_SCOPE_REQUIRED).
interface Node {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
}

function addScope(node: Node) {
	if (node.tagName === 'th' && node.properties && node.properties.scope === undefined) {
		node.properties.scope = 'col';
	}
	node.children?.forEach(addScope);
}

export default function rehypeTableScope() {
	return (tree: Node) => addScope(tree);
}
