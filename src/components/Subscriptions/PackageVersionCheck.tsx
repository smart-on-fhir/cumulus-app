import { useEffect, useState } from "react";
import aggregator, { humanizePackageId } from "../../Aggregator";
import Alert from "../generic/Alert";
import Terminology from "../../Terminology";


export default function PackageVersionCheck({ pkgId }: { pkgId: string }) {
    const [version, setVersion] = useState<string | null>(null)
    useEffect(() => {
        aggregator.getLatestPackageId(pkgId).then(setVersion)
    }, [pkgId])
    if (version === null) {
        return null;
    }
    if (version === "") {
        return null;
    }
    if (version === pkgId) {
        return null;
    }
    return <Alert color="orange" icon="fas fa-info-circle">
        {Terminology.subscription.nameSingular} can be upgraded to package <b>{humanizePackageId(version)}</b>
    </Alert>
}