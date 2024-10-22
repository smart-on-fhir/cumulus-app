import { useEffect, useState } from "react";
import aggregator, { humanizePackageId } from "../../Aggregator";
import Alert from "../generic/Alert";


export default function PackageVersionCheck({ pkgId }: { pkgId: string }) {
    const [version, setVersion] = useState<string | null>(null)
    useEffect(() => {
        aggregator.getLatestPackageId(pkgId).then(setVersion)
    })
    if (version === null) {
        return null;
    }
    if (version === "") {
        return null;
    }
    if (version === pkgId) {
        return null; // <Alert color="green">Subscription is up to date</Alert>
    }
    return <Alert color="orange" icon="fas fa-info-circle">
        Subscription can be upgraded to package <b>{humanizePackageId(version)}</b>
    </Alert>
}