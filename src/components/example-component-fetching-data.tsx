import { OptionsDatabase } from "@/utils/neon/server";

export default async function ExampleComponentFetchingData({  }) {
    const db = new OptionsDatabase();
    const data = await db.getData() || [];
    return <div>
        <h3>Data fetched from Neon will show up here</h3>
        <h4>Edit the example component with an actual table name and print the data</h4>
        <pre>{JSON.stringify(data)}</pre>
    </div>
}