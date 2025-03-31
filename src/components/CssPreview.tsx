import Markdown from "markdown-to-jsx";
import Grid from "./generic/Grid";
import Alert from "./generic/Alert";
import Toggle from "./generic/Toggle";

export default function CssPreview() {
    
    return (
        <div className="row wrap" style={{ gap: "2rem" }}>
            <div>
                <b>Headings</b>
                <hr />
                <h1>H1 Heading</h1>
                <h2>H2 Heading</h2>
                <h3>H3 Heading</h3>
                <h4>H4 Heading</h4>
                <h5>H5 Heading</h5>
                <h6>H6 Heading</h6>
            </div>
            <div>
                <b>LineBreak</b>
                <hr/>
                <div>Line1<br/>Line 2</div>
            </div>
            <div>
                <b>Paragraphs</b>
                <hr/>
                <p>Paragraph 1</p>
                <p>Paragraph 2</p>
            </div>

            <div>
                <b>Small</b>
                <hr/>
                <small>This is a small text</small>
            </div>

            <div>
                <b>code</b>
                <hr/>
                <code>This is a code text</code>
            </div>

            <div>
                <b>pre</b>
                <hr/>
                <pre>This is text is in pre</pre>
                <pre>This is <code>a code nested inside pre</code></pre>
            </div>

            <div>
                <b>label</b>
                <hr/>
                <label>This is a label</label>
            </div>

            <div>
                <b>links</b>
                <hr/>
                <a href="/">This is A link</a><br/>
                <a href="/" className="link">This is A.link link</a><br/>
                <b className="link">This is B.link</b>
            </div>

            <div>
                <b>.underline</b>
                <hr/>
                <div className="underline">This is div.underline</div>
            </div>

            <div>
                <b>Colors</b>
                <hr/>
                <div className="color-blue">.color-blue</div>
                <div className="color-blue-dark">.color-blue-dark</div>
                <div className="color-orange">.color-orange</div>
                <div className="color-red">.color-red</div>
                <div className="color-grey">.color-grey</div>
                <div className="color-green">.color-green</div>
                <div className="color-brand-2">.color-brand-2</div>
                <div className="color-muted">.color-muted</div>
                <div className="color-soft">.color-soft</div>

                <div className="string">.string</div>
                <div className="integer">.integer</div>
                <div className="float">.float</div>
                <div className="number">.number</div>
                <div className="boolean">.boolean</div>
                <div className="boolean-true">.boolean-true</div>
                <div className="boolean-false">.boolean-false</div>
                <div className="date">.date</div>
                <div className="object">.object</div>
                <div className="array">.array</div>
                <div className="null">.null</div>
            </div>

            <div>
                <b>BG Colors</b>
                <hr/>
                <div className="bg-blue">.bg-blue</div>
                {/* <div className="bg-blue-dark">.bg-blue-dark</div> */}
                <div className="bg-orange">.bg-orange</div>
                <div className="bg-red">.bg-red</div>
                <div className="bg-grey">.bg-grey</div>
                <div className="bg-green">.bg-green</div>
                <div className="bg-brand-2">.bg-brand-2</div>
                {/* <div className="bg-muted">.bg-muted</div> */}
                {/* <div className="bg-soft">.bg-soft</div> */}
                <div className="bg-white">.bg-white</div>
            </div>

            <div>
                <b>HRs</b>
                <hr/>
                HR:
                <hr/>
                HR.dashed:
                <hr className="dashed"/>
                HR.small:
                <hr className="small"/>
                HR.dashed.small:
                <hr className="dashed small"/>

                HR.color-blue:
                <hr className="color-blue"/>
                HR.color-blue-dark:
                <hr className="color-blue-dark"/>
                HR.color-orange:
                <hr className="color-orange"/>
                HR.color-red:
                <hr className="color-red"/>
                HR.color-grey:
                <hr className="color-grey"/>
                HR.color-green:
                <hr className="color-green"/>
                HR.color-brand-2:
                <hr className="color-brand-2"/>
            </div>

            <div>
                <b>Lists</b>
                <hr/>
                <ul>
                    <li>UL LI 1</li>
                    <li>UL LI 2
                        <ul>
                            <li>UL LI UL LI 2.1</li>
                        </ul>
                    </li>
                    <li>UL LI 3</li>
                </ul>
            </div>

            <div>
                <b>Markdown</b>
                <hr/>
                <div>
                <Markdown>
                    ***This is a test markdown***
                    - It contains `code` sections and [links](whatever)
                </Markdown>
                </div>
            </div>

            <div>
                <b>badge</b>
                <hr/>
                <span className="badge">.badge</span>&nbsp;
                <span className="badge bg-blue">.bg-blue</span>&nbsp;
                <span className="badge bg-orange">.bg-orange</span>&nbsp;
                <span className="badge bg-red">.bg-red</span>&nbsp;
                <span className="badge bg-grey">.bg-grey</span>&nbsp;
                <span className="badge bg-green">.bg-green</span>&nbsp;
                <span className="badge bg-brand-2">.bg-brand-2</span>
            </div>

            <div>
                <b>Icons</b>
                <hr/>
                .material-symbols-outlined: <span className="material-symbols-outlined">build_circle</span><br/>
                .material-symbols-rounded: <span className="material-symbols-rounded">build_circle</span><br/>
                {/* .material-icons: <span className="material-icons">build_circle</span><br/> */}
                .material-icons-round: <span className="material-icons-round">build_circle</span><br/>
            </div>

            <div>
                <b>panel</b>
                <hr/>
                <br/>
                <div className="panel">
                    .panel
                    <h3>Heading 3</h3>
                    <h4>Heading 4</h4>
                </div>
                <br/>
                <div className="panel panel-danger">
                    .panel.panel-danger
                    <h3>Heading 3</h3>
                    <h4>Heading 4</h4>
                </div>
            </div>

            <div>
                <b>Alerts</b>
                <hr/>
                <br /><Alert color="blue">color="blue"</Alert>
                <br /><Alert color="red">color="red"</Alert>
                <br /><Alert color="orange">color="orange"</Alert>
                <br /><Alert color="grey">color="grey"</Alert>
                <br /><Alert color="green">color="green"</Alert>
            </div>

            <div>
                <b>Form Elements</b>
                <hr/>
                <Grid gap="1rem 4px" cols="10rem">
                    <div>
                        <div>
                            <label>text</label>
                            <input type="text" defaultValue="test" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>text:readonly</label>
                            <input type="text" defaultValue="test" autoComplete="no" placeholder="placeholder" readOnly />
                        </div>
                        <div>
                            <label>text:disabled</label>
                            <input type="text" defaultValue="test" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>text:invalid</label>
                            <input type="text" defaultValue="" required autoComplete="no" placeholder="placeholder" />
                        </div>
                    </div>
                
                    <div>
                        <div>
                            <label>email</label>
                            <input type="email" defaultValue="email@host.dev" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>email:readonly</label>
                            <input type="email" defaultValue="email@host.dev" autoComplete="no" placeholder="placeholder" readOnly />
                        </div>
                        <div>
                            <label>email:disabled</label>
                            <input type="email" defaultValue="email@host.dev" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>email:invalid</label>
                            <input type="email" defaultValue="email.at.host.dev" autoComplete="no" placeholder="placeholder" />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>search</label>
                            <input type="search" defaultValue="search" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>search:readonly</label>
                            <input type="search" defaultValue="search" autoComplete="no" placeholder="placeholder" readOnly />
                        </div>
                        <div>
                            <label>search:disabled</label>
                            <input type="search" defaultValue="search" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>search:invalid</label>
                            <input type="search" defaultValue="" autoComplete="no" placeholder="placeholder" required />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>password</label>
                            <input type="password" defaultValue="pass" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>password:readonly</label>
                            <input type="password" defaultValue="pass" autoComplete="no" placeholder="placeholder" readOnly />
                        </div>
                        <div>
                            <label>password:disabled</label>
                            <input type="password" defaultValue="pass" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>password:invalid</label>
                            <input type="password" defaultValue="" autoComplete="no" placeholder="placeholder" required />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>number</label>
                            <input type="number" defaultValue={100} />
                        </div>
                        <div>
                            <label>number:disabled</label>
                            <input type="number" defaultValue={100} disabled />
                        </div>
                        <div>
                            <label>number:invalid</label>
                            <input type="number" defaultValue={100} max={2} />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>date</label>
                            <input type="date" defaultValue="2025-03-24" />
                        </div>
                        <div>
                            <label>date:disabled</label>
                            <input type="date" defaultValue="2025-03-24" disabled />
                        </div>
                        <div>
                            <label>date:invalid</label>
                            <input type="date" defaultValue="2025-03-24" max="2025-02-24"/>
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>url</label>
                            <input type="url" defaultValue="https://whatever" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>url:disabled</label>
                            <input type="url" defaultValue="https://whatever" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>url:invalid</label>
                            <input type="url" defaultValue="whatever" autoComplete="no" placeholder="placeholder" />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>phone</label>
                            <input type="phone" defaultValue="123456" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>phone:disabled</label>
                            <input type="phone" defaultValue="123456" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>phone:invalid</label>
                            <input type="phone" defaultValue="" autoComplete="no" placeholder="placeholder" required />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>file</label>
                            <input type="file" defaultValue="" autoComplete="no" placeholder="placeholder" />
                        </div>
                        <div>
                            <label>file:disabled</label>
                            <input type="file" defaultValue="" autoComplete="no" placeholder="placeholder" disabled />
                        </div>
                        <div>
                            <label>file:invalid</label>
                            <input type="file" defaultValue="" autoComplete="no" placeholder="placeholder" required />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>select</label>
                            <select placeholder="placeholder">
                                <option>Option 1</option>
                            </select>
                        </div>
                        <div>
                            <label>select:disabled</label>
                            <select placeholder="placeholder" disabled>
                                <option>Option 1</option>
                            </select>
                        </div>
                        <div>
                            <label>select:invalid</label>
                            <select placeholder="placeholder" defaultValue="2" required>
                                <option value="">Option 1</option>
                            </select>
                        </div>
                    </div>

                </Grid>
            </div>
            <div>
                <div>
                    <div>
                        <label>color</label><br/>
                        <input type="color" defaultValue="#FF8800" />
                    </div>
                    <div>
                        <label>color:disabled</label><br/>
                        <input type="color" defaultValue="#FF8800" disabled />
                    </div>
                    <div>
                        <label>color:invalid</label><br/>
                        <input type="color" defaultValue="#FF8800XX" />
                    </div>
                    <div>
                        <label>color:empty</label><br/>
                        <input type="color" defaultValue="" />
                    </div>
                    <div>
                        <label>color - transparent</label><br/>
                        <input type="color" defaultValue="#FF880088" />
                    </div>
                </div>

                <div>
                    <div>
                        <label>Multi-Select</label>
                        <div style={{ height: "3rem" }}>
                            <select size={3} multiple>
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Multi-Select:readonly</label>
                        <div style={{ height: "3rem" }}>
                            <select size={3} multiple aria-readonly defaultValue={1}>
                                <option value={1}>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Multi-Select:disabled</label>
                        <div style={{ height: "3rem" }}>
                            <select size={3} multiple disabled defaultValue={1}>
                                <option value={1}>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Multi-Select:invalid</label>
                        <div style={{ height: "3rem" }}>
                            <select size={3} multiple defaultValue="3" required>
                                <option value="0" selected>Option 1</option>
                                <option value="1">Option 2</option>
                                <option value="2">Option 3</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <label>textarea</label>
                        <textarea defaultValue="This is a test" />
                    </div>
                    <div>
                        <label>textarea:readonly</label>
                        <textarea defaultValue="This is a test" readOnly />
                    </div>
                    <div>
                        <label>textarea:disabled</label>
                        <textarea defaultValue="This is a test" disabled />
                    </div>
                    <div>
                        <label>textarea:invalid</label>
                        <textarea defaultValue="" required placeholder="placeholder" />
                    </div>
                </div>

                <div>
                    <label><input type="checkbox" /> checkbox</label><br/>
                    <label><input type="checkbox" defaultChecked /> checked</label><br/>
                    <label><input type="checkbox" disabled /> disabled</label><br/>
                    <label><input type="checkbox" defaultChecked disabled /> disabled checked</label><br/>
                    <br/>
                    <label><input type="radio" /> radio</label><br/>
                    <label><input type="radio" disabled /> disabled</label><br/>
                    <label><input type="radio" defaultChecked /> checked</label><br/>
                    <label><input type="radio" defaultChecked disabled /> checked disabled</label><br/>
                </div>
            </div>
            <div>
                <div>
                    <button className="mb-05">button</button><br/>
                    <button className="btn mb-05">.btn</button><br/>
                    <button className="btn-blue mb-05">.btn-blue</button><br/>
                    <button className="btn-green mb-05">.btn-green</button><br/>
                    <button className="btn-brand-2 mb-05">.btn-brand-2</button><br/>
                    <button className="btn btn-virtual mb-05">.btn.btn-virtual</button><br/>
                    <button className="btn-blue btn-virtual mb-05">.btn-blue.btn-virtual</button><br/>
                    <button className="btn-blue-dark btn-virtual mb-05">.btn-blue-dark.btn-virtual</button><br/>
                    <button className="btn-brand-2 btn-virtual mb-05">.btn-brand-2.btn-virtual</button><br/>
                </div>
            </div>
            <div>
                <div>
                    <div className="toolbar">
                        <button className="btn">btn</button>
                        <button className="btn active">btn</button>
                        <button className="btn">btn</button>
                    </div>
                    <br/>
                    <div className="toolbar">
                        <button className="btn-blue">btn</button>
                        <button className="btn-blue active">btn</button>
                        <button className="btn-blue">btn</button>
                    </div>
                    <br/>
                    <div className="toolbar">
                        <button className="btn-green">btn</button>
                        <button className="btn-green active">btn</button>
                        <button className="btn-green">btn</button>
                    </div>
                    <br/>
                    <div className="toolbar">
                        <button className="btn-brand-2">btn</button>
                        <button className="btn-brand-2 active">btn</button>
                        <button className="btn-brand-2">btn</button>
                    </div>
                    <br/>
                    <div className="toolbar">
                        <button className="btn btn-virtual">btn</button>
                        <button className="btn btn-virtual active">btn</button>
                        <button className="btn btn-virtual">btn</button>
                    </div>
                    <br/>
                    <div className="toolbar">
                        <button className="btn-blue btn-virtual">btn</button>
                        <button className="btn-blue btn-virtual active">btn</button>
                        <button className="btn-blue btn-virtual">btn</button>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <p><Toggle checked onChange={() => {}} />                          <Toggle checked={false} onChange={() => {}} />                          <Toggle checked disabled onChange={() => {}} />                          <Toggle checked={false} disabled onChange={() => {}} /></p>
                    <p><Toggle checked onChange={() => {}} className="bg-green" />     <Toggle checked={false} onChange={() => {}} className="bg-green" />     <Toggle checked disabled onChange={() => {}} className="bg-green" />     <Toggle checked={false} disabled onChange={() => {}} className="bg-green" /></p>
                    <p><Toggle checked onChange={() => {}} className="bg-blue-dark" /> <Toggle checked={false} onChange={() => {}} className="bg-blue-dark" /> <Toggle checked disabled onChange={() => {}} className="bg-blue-dark" /> <Toggle checked={false} disabled onChange={() => {}} className="bg-blue-dark" /></p>
                    <p><Toggle checked onChange={() => {}} className="bg-brand-2" />   <Toggle checked={false} onChange={() => {}} className="bg-brand-2" />   <Toggle checked disabled onChange={() => {}} className="bg-brand-2" />   <Toggle checked={false} disabled onChange={() => {}} className="bg-brand-2" /></p>
                    <p><Toggle checked onChange={() => {}} className="bg-orange" />    <Toggle checked={false} onChange={() => {}} className="bg-orange" />    <Toggle checked disabled onChange={() => {}} className="bg-orange" />    <Toggle checked={false} disabled onChange={() => {}} className="bg-orange" /></p>
                    <p><Toggle checked onChange={() => {}} className="bg-red" />       <Toggle checked={false} onChange={() => {}} className="bg-red" />       <Toggle checked disabled onChange={() => {}} className="bg-red" />       <Toggle checked={false} disabled onChange={() => {}} className="bg-red" /></p>
                </div>
            </div>
        </div>
    )
}