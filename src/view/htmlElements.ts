import { ConfigurableElement, UseData } from "./render/viewRenderer.js";
import { GetState, State, Stateful } from "../store/index.js";
import { SpecialElementAttributes } from "./specialAttributes.js";
import { ElementSupport } from "./elementSupport.js";

export type HTMLView = (root: HTMLBuilder) => void;

export interface HTMLCaseSelector<T> {
    when<X extends T>(typePredicate: (val: T) => val is X, generator: (state: State<X>) => HTMLView): HTMLCaseSelector<T>;
    default(generator: (state: State<T>) => HTMLView): void;
}

export interface HTMLConditionSelector {
    when(predicate: (get: GetState) => boolean, view: HTMLView): HTMLConditionSelector;
    default(view: HTMLView): void;
}

export interface HTMLViewSelector {
    withUnion<T>(unionValue: (get: GetState) => T): HTMLCaseSelector<T>;
    withConditions(): HTMLConditionSelector;
}

export interface SpecialHTMLElements {
    element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements>) => void, support?: ElementSupport): this;
    textNode(value: string | Stateful<string | undefined>): this;
    subview(value: HTMLView): this;
    subviewFrom(selectorGenerator: (selector: HTMLViewSelector) => void): this;
    subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (useData: UseData<T>) => HTMLView): this;
}

export interface GlobalHTMLAttributes {
    accesskey(value: string | Stateful<string | undefined>): this;
    autocapitalize(value: string | Stateful<string | undefined>): this;
    autofocus(value: boolean | Stateful<boolean | undefined>): this;
    class(value: string | Stateful<string | undefined>): this;
    contenteditable(value: string | Stateful<string | undefined>): this;
    dir(value: string | Stateful<string | undefined>): this;
    draggable(value: string | Stateful<string | undefined>): this;
    enterkeyhint(value: string | Stateful<string | undefined>): this;
    hidden(value: string | Stateful<string | undefined>): this;
    id(value: string | Stateful<string | undefined>): this;
    inert(value: boolean | Stateful<boolean | undefined>): this;
    inputmode(value: string | Stateful<string | undefined>): this;
    is(value: string | Stateful<string | undefined>): this;
    itemid(value: string | Stateful<string | undefined>): this;
    itemprop(value: string | Stateful<string | undefined>): this;
    itemref(value: string | Stateful<string | undefined>): this;
    itemscope(value: boolean | Stateful<boolean | undefined>): this;
    itemtype(value: string | Stateful<string | undefined>): this;
    lang(value: string | Stateful<string | undefined>): this;
    nonce(value: string | Stateful<string | undefined>): this;
    popover(value: string | Stateful<string | undefined>): this;
    slot(value: string | Stateful<string | undefined>): this;
    spellcheck(value: string | Stateful<string | undefined>): this;
    style(value: string | Stateful<string | undefined>): this;
    tabindex(value: string | Stateful<string | undefined>): this;
    title(value: string | Stateful<string | undefined>): this;
    translate(value: string | Stateful<string | undefined>): this;
    writingsuggestions(value: string | Stateful<string | undefined>): this;
    role(value: string | Stateful<string | undefined>): this;
}

export interface HTMLBuilder extends SpecialHTMLElements {
    a(builder?: (element: ConfigurableElement<AElementAttributes, HTMLElements>) => void): void;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes, HTMLElements>) => void): void;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes, HTMLElements>) => void): void;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes, never>) => void): void;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes, HTMLElements>) => void): void;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes, HTMLElements>) => void): void;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes, HTMLElements>) => void): void;
    b(builder?: (element: ConfigurableElement<BElementAttributes, HTMLElements>) => void): void;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes, never>) => void): void;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes, HTMLElements>) => void): void;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes, HTMLElements>) => void): void;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes, HTMLElements>) => void): void;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes, HTMLElements>) => void): void;
    br(builder?: (element: ConfigurableElement<BrElementAttributes, never>) => void): void;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes, HTMLElements>) => void): void;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes, HTMLElements>) => void): void;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes, HTMLElements>) => void): void;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes, HTMLElements>) => void): void;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes, HTMLElements>) => void): void;
    col(builder?: (element: ConfigurableElement<ColElementAttributes, never>) => void): void;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes, HTMLElements>) => void): void;
    data(builder?: (element: ConfigurableElement<DataElementAttributes, HTMLElements>) => void): void;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes, HTMLElements>) => void): void;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes, HTMLElements>) => void): void;
    del(builder?: (element: ConfigurableElement<DelElementAttributes, HTMLElements>) => void): void;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes, HTMLElements>) => void): void;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes, HTMLElements>) => void): void;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes, HTMLElements>) => void): void;
    div(builder?: (element: ConfigurableElement<DivElementAttributes, HTMLElements>) => void): void;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes, HTMLElements>) => void): void;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes, HTMLElements>) => void): void;
    em(builder?: (element: ConfigurableElement<EmElementAttributes, HTMLElements>) => void): void;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes, never>) => void): void;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes, HTMLElements>) => void): void;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes, HTMLElements>) => void): void;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes, HTMLElements>) => void): void;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes, HTMLElements>) => void): void;
    form(builder?: (element: ConfigurableElement<FormElementAttributes, HTMLElements>) => void): void;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes, HTMLElements>) => void): void;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes, HTMLElements>) => void): void;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes, HTMLElements>) => void): void;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes, HTMLElements>) => void): void;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes, HTMLElements>) => void): void;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes, HTMLElements>) => void): void;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLElements>) => void): void;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes, HTMLElements>) => void): void;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes, HTMLElements>) => void): void;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes, never>) => void): void;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes, HTMLElements>) => void): void;
    i(builder?: (element: ConfigurableElement<IElementAttributes, HTMLElements>) => void): void;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes, HTMLElements>) => void): void;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes, never>) => void): void;
    input(builder?: (element: ConfigurableElement<InputElementAttributes, never>) => void): void;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes, HTMLElements>) => void): void;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes, HTMLElements>) => void): void;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes, HTMLElements>) => void): void;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes, HTMLElements>) => void): void;
    li(builder?: (element: ConfigurableElement<LiElementAttributes, HTMLElements>) => void): void;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes, never>) => void): void;
    main(builder?: (element: ConfigurableElement<MainElementAttributes, HTMLElements>) => void): void;
    map(builder?: (element: ConfigurableElement<MapElementAttributes, HTMLElements>) => void): void;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes, HTMLElements>) => void): void;
    math(builder?: (element: ConfigurableElement<MathElementAttributes, HTMLElements>) => void): void;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes, HTMLElements>) => void): void;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes, never>) => void): void;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes, never>) => void): void;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes, HTMLElements>) => void): void;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes, HTMLElements>) => void): void;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes, HTMLElements>) => void): void;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes, HTMLElements>) => void): void;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes, HTMLElements>) => void): void;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes, HTMLElements>) => void): void;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes, HTMLElements>) => void): void;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes, HTMLElements>) => void): void;
    p(builder?: (element: ConfigurableElement<PElementAttributes, HTMLElements>) => void): void;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes, never>) => void): void;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes, HTMLElements>) => void): void;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes, HTMLElements>) => void): void;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes, HTMLElements>) => void): void;
    q(builder?: (element: ConfigurableElement<QElementAttributes, HTMLElements>) => void): void;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes, HTMLElements>) => void): void;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes, HTMLElements>) => void): void;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes, HTMLElements>) => void): void;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes, HTMLElements>) => void): void;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes, HTMLElements>) => void): void;
    s(builder?: (element: ConfigurableElement<SElementAttributes, HTMLElements>) => void): void;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes, HTMLElements>) => void): void;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void): void;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes, HTMLElements>) => void): void;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes, HTMLElements>) => void): void;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes, HTMLElements>) => void): void;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes, HTMLElements>) => void): void;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes, HTMLElements>) => void): void;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes, never>) => void): void;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes, HTMLElements>) => void): void;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes, HTMLElements>) => void): void;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes, HTMLElements>) => void): void;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes, HTMLElements>) => void): void;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes, HTMLElements>) => void): void;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes, HTMLElements>) => void): void;
    table(builder?: (element: ConfigurableElement<TableElementAttributes, HTMLElements>) => void): void;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes, HTMLElements>) => void): void;
    td(builder?: (element: ConfigurableElement<TdElementAttributes, HTMLElements>) => void): void;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes, HTMLElements>) => void): void;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes, HTMLElements>) => void): void;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes, HTMLElements>) => void): void;
    th(builder?: (element: ConfigurableElement<ThElementAttributes, HTMLElements>) => void): void;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes, HTMLElements>) => void): void;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes, HTMLElements>) => void): void;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes, HTMLElements>) => void): void;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes, HTMLElements>) => void): void;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes, never>) => void): void;
    u(builder?: (element: ConfigurableElement<UElementAttributes, HTMLElements>) => void): void;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes, HTMLElements>) => void): void;
    var(builder?: (element: ConfigurableElement<VarElementAttributes, HTMLElements>) => void): void;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes, HTMLElements>) => void): void;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes, never>) => void): void;
}

export interface HTMLElements extends SpecialHTMLElements {
    a(builder?: (element: ConfigurableElement<AElementAttributes, HTMLElements>) => void): this;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes, HTMLElements>) => void): this;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes, HTMLElements>) => void): this;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes, never>) => void): this;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes, HTMLElements>) => void): this;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes, HTMLElements>) => void): this;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes, HTMLElements>) => void): this;
    b(builder?: (element: ConfigurableElement<BElementAttributes, HTMLElements>) => void): this;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes, never>) => void): this;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes, HTMLElements>) => void): this;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes, HTMLElements>) => void): this;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes, HTMLElements>) => void): this;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes, HTMLElements>) => void): this;
    br(builder?: (element: ConfigurableElement<BrElementAttributes, never>) => void): this;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes, HTMLElements>) => void): this;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes, HTMLElements>) => void): this;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes, HTMLElements>) => void): this;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes, HTMLElements>) => void): this;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes, HTMLElements>) => void): this;
    col(builder?: (element: ConfigurableElement<ColElementAttributes, never>) => void): this;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes, HTMLElements>) => void): this;
    data(builder?: (element: ConfigurableElement<DataElementAttributes, HTMLElements>) => void): this;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes, HTMLElements>) => void): this;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes, HTMLElements>) => void): this;
    del(builder?: (element: ConfigurableElement<DelElementAttributes, HTMLElements>) => void): this;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes, HTMLElements>) => void): this;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes, HTMLElements>) => void): this;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes, HTMLElements>) => void): this;
    div(builder?: (element: ConfigurableElement<DivElementAttributes, HTMLElements>) => void): this;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes, HTMLElements>) => void): this;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes, HTMLElements>) => void): this;
    em(builder?: (element: ConfigurableElement<EmElementAttributes, HTMLElements>) => void): this;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes, never>) => void): this;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes, HTMLElements>) => void): this;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes, HTMLElements>) => void): this;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes, HTMLElements>) => void): this;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes, HTMLElements>) => void): this;
    form(builder?: (element: ConfigurableElement<FormElementAttributes, HTMLElements>) => void): this;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes, HTMLElements>) => void): this;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes, HTMLElements>) => void): this;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes, HTMLElements>) => void): this;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes, HTMLElements>) => void): this;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes, HTMLElements>) => void): this;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes, HTMLElements>) => void): this;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLElements>) => void): this;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes, HTMLElements>) => void): this;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes, HTMLElements>) => void): this;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes, never>) => void): this;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes, HTMLElements>) => void): this;
    i(builder?: (element: ConfigurableElement<IElementAttributes, HTMLElements>) => void): this;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes, HTMLElements>) => void): this;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes, never>) => void): this;
    input(builder?: (element: ConfigurableElement<InputElementAttributes, never>) => void): this;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes, HTMLElements>) => void): this;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes, HTMLElements>) => void): this;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes, HTMLElements>) => void): this;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes, HTMLElements>) => void): this;
    li(builder?: (element: ConfigurableElement<LiElementAttributes, HTMLElements>) => void): this;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes, never>) => void): this;
    main(builder?: (element: ConfigurableElement<MainElementAttributes, HTMLElements>) => void): this;
    map(builder?: (element: ConfigurableElement<MapElementAttributes, HTMLElements>) => void): this;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes, HTMLElements>) => void): this;
    math(builder?: (element: ConfigurableElement<MathElementAttributes, HTMLElements>) => void): this;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes, HTMLElements>) => void): this;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes, never>) => void): this;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes, never>) => void): this;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes, HTMLElements>) => void): this;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes, HTMLElements>) => void): this;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes, HTMLElements>) => void): this;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes, HTMLElements>) => void): this;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes, HTMLElements>) => void): this;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes, HTMLElements>) => void): this;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes, HTMLElements>) => void): this;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes, HTMLElements>) => void): this;
    p(builder?: (element: ConfigurableElement<PElementAttributes, HTMLElements>) => void): this;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes, never>) => void): this;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes, HTMLElements>) => void): this;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes, HTMLElements>) => void): this;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes, HTMLElements>) => void): this;
    q(builder?: (element: ConfigurableElement<QElementAttributes, HTMLElements>) => void): this;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes, HTMLElements>) => void): this;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes, HTMLElements>) => void): this;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes, HTMLElements>) => void): this;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes, HTMLElements>) => void): this;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes, HTMLElements>) => void): this;
    s(builder?: (element: ConfigurableElement<SElementAttributes, HTMLElements>) => void): this;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes, HTMLElements>) => void): this;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void): this;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes, HTMLElements>) => void): this;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes, HTMLElements>) => void): this;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes, HTMLElements>) => void): this;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes, HTMLElements>) => void): this;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes, HTMLElements>) => void): this;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes, never>) => void): this;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes, HTMLElements>) => void): this;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes, HTMLElements>) => void): this;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes, HTMLElements>) => void): this;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes, HTMLElements>) => void): this;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes, HTMLElements>) => void): this;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes, HTMLElements>) => void): this;
    table(builder?: (element: ConfigurableElement<TableElementAttributes, HTMLElements>) => void): this;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes, HTMLElements>) => void): this;
    td(builder?: (element: ConfigurableElement<TdElementAttributes, HTMLElements>) => void): this;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes, HTMLElements>) => void): this;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes, HTMLElements>) => void): this;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes, HTMLElements>) => void): this;
    th(builder?: (element: ConfigurableElement<ThElementAttributes, HTMLElements>) => void): this;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes, HTMLElements>) => void): this;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes, HTMLElements>) => void): this;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes, HTMLElements>) => void): this;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes, HTMLElements>) => void): this;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes, never>) => void): this;
    u(builder?: (element: ConfigurableElement<UElementAttributes, HTMLElements>) => void): this;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes, HTMLElements>) => void): this;
    var(builder?: (element: ConfigurableElement<VarElementAttributes, HTMLElements>) => void): this;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes, HTMLElements>) => void): this;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes, never>) => void): this;
}

export interface AElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    charset(value: string | Stateful<string | undefined>): AElementAttributes;
    coords(value: string | Stateful<string | undefined>): AElementAttributes;
    download(value: string | Stateful<string | undefined>): AElementAttributes;
    href(value: string | Stateful<string | undefined>): AElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): AElementAttributes;
    name(value: string | Stateful<string | undefined>): AElementAttributes;
    ping(value: string | Stateful<string | undefined>): AElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): AElementAttributes;
    rel(value: string | Stateful<string | undefined>): AElementAttributes;
    rev(value: string | Stateful<string | undefined>): AElementAttributes;
    shape(value: string | Stateful<string | undefined>): AElementAttributes;
    target(value: string | Stateful<string | undefined>): AElementAttributes;
    type(value: string | Stateful<string | undefined>): AElementAttributes;
}

export interface AbbrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AddressElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AreaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    alt(value: string | Stateful<string | undefined>): AreaElementAttributes;
    coords(value: string | Stateful<string | undefined>): AreaElementAttributes;
    download(value: string | Stateful<string | undefined>): AreaElementAttributes;
    href(value: string | Stateful<string | undefined>): AreaElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): AreaElementAttributes;
    nohref(value: string | Stateful<string | undefined>): AreaElementAttributes;
    ping(value: string | Stateful<string | undefined>): AreaElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): AreaElementAttributes;
    rel(value: string | Stateful<string | undefined>): AreaElementAttributes;
    shape(value: string | Stateful<string | undefined>): AreaElementAttributes;
    target(value: string | Stateful<string | undefined>): AreaElementAttributes;
    type(value: string | Stateful<string | undefined>): AreaElementAttributes;
}

export interface ArticleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AsideElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AudioElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    controls(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): AudioElementAttributes;
    loop(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    muted(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    preload(value: string | Stateful<string | undefined>): AudioElementAttributes;
    src(value: string | Stateful<string | undefined>): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BaseElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    href(value: string | Stateful<string | undefined>): BaseElementAttributes;
    target(value: string | Stateful<string | undefined>): BaseElementAttributes;
}

export interface BdiElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BdoElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BlockquoteElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    alink(value: string | Stateful<string | undefined>): BodyElementAttributes;
    background(value: string | Stateful<string | undefined>): BodyElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): BodyElementAttributes;
    link(value: string | Stateful<string | undefined>): BodyElementAttributes;
    text(value: string | Stateful<string | undefined>): BodyElementAttributes;
    vlink(value: string | Stateful<string | undefined>): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    clear(value: string | Stateful<string | undefined>): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): ButtonElementAttributes;
    form(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formaction(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formenctype(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formmethod(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean | undefined>): ButtonElementAttributes;
    formtarget(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    name(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    popovertarget(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    popovertargetaction(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    type(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    value(value: string | Stateful<string | undefined>): ButtonElementAttributes;
}

export interface CanvasElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): CanvasElementAttributes;
    width(value: string | Stateful<string | undefined>): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): CaptionElementAttributes;
}

export interface CiteElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface CodeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface ColElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ColElementAttributes;
    char(value: string | Stateful<string | undefined>): ColElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ColElementAttributes;
    span(value: string | Stateful<string | undefined>): ColElementAttributes;
    valign(value: string | Stateful<string | undefined>): ColElementAttributes;
    width(value: string | Stateful<string | undefined>): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    char(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    span(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    valign(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    width(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
}

export interface DataElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    value(value: string | Stateful<string | undefined>): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DelElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): DelElementAttributes;
    datetime(value: string | Stateful<string | undefined>): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): DetailsElementAttributes;
    open(value: boolean | Stateful<boolean | undefined>): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DialogElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    open(value: boolean | Stateful<boolean | undefined>): DialogElementAttributes;
}

export interface DivElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface EmElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface EmbedElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    src(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    type(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    width(value: string | Stateful<string | undefined>): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): FieldsetElementAttributes;
    form(value: string | Stateful<string | undefined>): FieldsetElementAttributes;
    name(value: string | Stateful<string | undefined>): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FigureElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FooterElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FormElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string | undefined>): FormElementAttributes;
    acceptCharset(value: string | Stateful<string | undefined>): FormElementAttributes;
    action(value: string | Stateful<string | undefined>): FormElementAttributes;
    autocomplete(value: string | Stateful<string | undefined>): FormElementAttributes;
    enctype(value: string | Stateful<string | undefined>): FormElementAttributes;
    method(value: string | Stateful<string | undefined>): FormElementAttributes;
    name(value: string | Stateful<string | undefined>): FormElementAttributes;
    novalidate(value: boolean | Stateful<boolean | undefined>): FormElementAttributes;
    target(value: string | Stateful<string | undefined>): FormElementAttributes;
}

export interface H1ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    profile(value: string | Stateful<string | undefined>): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface HgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface HrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): HrElementAttributes;
    noshade(value: string | Stateful<string | undefined>): HrElementAttributes;
    size(value: string | Stateful<string | undefined>): HrElementAttributes;
    width(value: string | Stateful<string | undefined>): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    manifest(value: string | Stateful<string | undefined>): HtmlElementAttributes;
    version(value: string | Stateful<string | undefined>): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface IframeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allow(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allowfullscreen(value: boolean | Stateful<boolean | undefined>): IframeElementAttributes;
    allowpaymentrequest(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allowusermedia(value: string | Stateful<string | undefined>): IframeElementAttributes;
    frameborder(value: string | Stateful<string | undefined>): IframeElementAttributes;
    height(value: string | Stateful<string | undefined>): IframeElementAttributes;
    loading(value: string | Stateful<string | undefined>): IframeElementAttributes;
    longdesc(value: string | Stateful<string | undefined>): IframeElementAttributes;
    marginheight(value: string | Stateful<string | undefined>): IframeElementAttributes;
    marginwidth(value: string | Stateful<string | undefined>): IframeElementAttributes;
    name(value: string | Stateful<string | undefined>): IframeElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): IframeElementAttributes;
    sandbox(value: string | Stateful<string | undefined>): IframeElementAttributes;
    scrolling(value: string | Stateful<string | undefined>): IframeElementAttributes;
    src(value: string | Stateful<string | undefined>): IframeElementAttributes;
    srcdoc(value: string | Stateful<string | undefined>): IframeElementAttributes;
    width(value: string | Stateful<string | undefined>): IframeElementAttributes;
}

export interface ImgElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ImgElementAttributes;
    alt(value: string | Stateful<string | undefined>): ImgElementAttributes;
    border(value: string | Stateful<string | undefined>): ImgElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): ImgElementAttributes;
    decoding(value: string | Stateful<string | undefined>): ImgElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): ImgElementAttributes;
    height(value: string | Stateful<string | undefined>): ImgElementAttributes;
    hspace(value: string | Stateful<string | undefined>): ImgElementAttributes;
    ismap(value: boolean | Stateful<boolean | undefined>): ImgElementAttributes;
    loading(value: string | Stateful<string | undefined>): ImgElementAttributes;
    longdesc(value: string | Stateful<string | undefined>): ImgElementAttributes;
    name(value: string | Stateful<string | undefined>): ImgElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): ImgElementAttributes;
    sizes(value: string | Stateful<string | undefined>): ImgElementAttributes;
    src(value: string | Stateful<string | undefined>): ImgElementAttributes;
    srcset(value: string | Stateful<string | undefined>): ImgElementAttributes;
    usemap(value: string | Stateful<string | undefined>): ImgElementAttributes;
    vspace(value: string | Stateful<string | undefined>): ImgElementAttributes;
    width(value: string | Stateful<string | undefined>): ImgElementAttributes;
}

export interface InputElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string | undefined>): InputElementAttributes;
    align(value: string | Stateful<string | undefined>): InputElementAttributes;
    alt(value: string | Stateful<string | undefined>): InputElementAttributes;
    autocomplete(value: string | Stateful<string | undefined>): InputElementAttributes;
    checked(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    dirname(value: string | Stateful<string | undefined>): InputElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    form(value: string | Stateful<string | undefined>): InputElementAttributes;
    formaction(value: string | Stateful<string | undefined>): InputElementAttributes;
    formenctype(value: string | Stateful<string | undefined>): InputElementAttributes;
    formmethod(value: string | Stateful<string | undefined>): InputElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    formtarget(value: string | Stateful<string | undefined>): InputElementAttributes;
    height(value: string | Stateful<string | undefined>): InputElementAttributes;
    ismap(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    list(value: string | Stateful<string | undefined>): InputElementAttributes;
    max(value: string | Stateful<string | undefined>): InputElementAttributes;
    maxlength(value: string | Stateful<string | undefined>): InputElementAttributes;
    min(value: string | Stateful<string | undefined>): InputElementAttributes;
    minlength(value: string | Stateful<string | undefined>): InputElementAttributes;
    multiple(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    name(value: string | Stateful<string | undefined>): InputElementAttributes;
    pattern(value: string | Stateful<string | undefined>): InputElementAttributes;
    placeholder(value: string | Stateful<string | undefined>): InputElementAttributes;
    popovertarget(value: string | Stateful<string | undefined>): InputElementAttributes;
    popovertargetaction(value: string | Stateful<string | undefined>): InputElementAttributes;
    readonly(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    size(value: string | Stateful<string | undefined>): InputElementAttributes;
    src(value: string | Stateful<string | undefined>): InputElementAttributes;
    step(value: string | Stateful<string | undefined>): InputElementAttributes;
    type(value: string | Stateful<string | undefined>): InputElementAttributes;
    usemap(value: string | Stateful<string | undefined>): InputElementAttributes;
    value(value: string | Stateful<string | undefined>): InputElementAttributes;
    width(value: string | Stateful<string | undefined>): InputElementAttributes;
}

export interface InsElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): InsElementAttributes;
    datetime(value: string | Stateful<string | undefined>): InsElementAttributes;
}

export interface KbdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface LabelElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string | undefined>): LabelElementAttributes;
    form(value: string | Stateful<string | undefined>): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    type(value: string | Stateful<string | undefined>): LiElementAttributes;
    value(value: string | Stateful<string | undefined>): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    as(value: string | Stateful<string | undefined>): LinkElementAttributes;
    blocking(value: string | Stateful<string | undefined>): LinkElementAttributes;
    charset(value: string | Stateful<string | undefined>): LinkElementAttributes;
    color(value: string | Stateful<string | undefined>): LinkElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): LinkElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): LinkElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): LinkElementAttributes;
    href(value: string | Stateful<string | undefined>): LinkElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): LinkElementAttributes;
    imagesizes(value: string | Stateful<string | undefined>): LinkElementAttributes;
    imagesrcset(value: string | Stateful<string | undefined>): LinkElementAttributes;
    integrity(value: string | Stateful<string | undefined>): LinkElementAttributes;
    media(value: string | Stateful<string | undefined>): LinkElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): LinkElementAttributes;
    rel(value: string | Stateful<string | undefined>): LinkElementAttributes;
    rev(value: string | Stateful<string | undefined>): LinkElementAttributes;
    sizes(value: string | Stateful<string | undefined>): LinkElementAttributes;
    target(value: string | Stateful<string | undefined>): LinkElementAttributes;
    type(value: string | Stateful<string | undefined>): LinkElementAttributes;
}

export interface MainElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MapElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MathElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MenuElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MetaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    charset(value: string | Stateful<string | undefined>): MetaElementAttributes;
    content(value: string | Stateful<string | undefined>): MetaElementAttributes;
    httpEquiv(value: string | Stateful<string | undefined>): MetaElementAttributes;
    media(value: string | Stateful<string | undefined>): MetaElementAttributes;
    name(value: string | Stateful<string | undefined>): MetaElementAttributes;
    scheme(value: string | Stateful<string | undefined>): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    high(value: string | Stateful<string | undefined>): MeterElementAttributes;
    low(value: string | Stateful<string | undefined>): MeterElementAttributes;
    max(value: string | Stateful<string | undefined>): MeterElementAttributes;
    min(value: string | Stateful<string | undefined>): MeterElementAttributes;
    optimum(value: string | Stateful<string | undefined>): MeterElementAttributes;
    value(value: string | Stateful<string | undefined>): MeterElementAttributes;
}

export interface NavElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface NoscriptElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface ObjectElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    archive(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    border(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    classid(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    codebase(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    codetype(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    data(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    declare(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    form(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    height(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    hspace(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    name(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    standby(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    type(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    typemustmatch(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    usemap(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    vspace(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    width(value: string | Stateful<string | undefined>): ObjectElementAttributes;
}

export interface OlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): OlElementAttributes;
    reversed(value: boolean | Stateful<boolean | undefined>): OlElementAttributes;
    start(value: string | Stateful<string | undefined>): OlElementAttributes;
    type(value: string | Stateful<string | undefined>): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): OptgroupElementAttributes;
    label(value: string | Stateful<string | undefined>): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): OptionElementAttributes;
    label(value: string | Stateful<string | undefined>): OptionElementAttributes;
    selected(value: boolean | Stateful<boolean | undefined>): OptionElementAttributes;
    value(value: string | Stateful<string | undefined>): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string | undefined>): OutputElementAttributes;
    form(value: string | Stateful<string | undefined>): OutputElementAttributes;
    name(value: string | Stateful<string | undefined>): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): ParamElementAttributes;
    type(value: string | Stateful<string | undefined>): ParamElementAttributes;
    value(value: string | Stateful<string | undefined>): ParamElementAttributes;
    valuetype(value: string | Stateful<string | undefined>): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface PreElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    width(value: string | Stateful<string | undefined>): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    max(value: string | Stateful<string | undefined>): ProgressElementAttributes;
    value(value: string | Stateful<string | undefined>): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): QElementAttributes;
}

export interface RbElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface RpElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface RtElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface RtcElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface RubyElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SampElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface ScriptElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    async(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    blocking(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    charset(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    defer(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    integrity(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    language(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    nomodule(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    src(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    type(value: string | Stateful<string | undefined>): ScriptElementAttributes;
}

export interface SearchElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SectionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SelectElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string | undefined>): SelectElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    form(value: string | Stateful<string | undefined>): SelectElementAttributes;
    multiple(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    name(value: string | Stateful<string | undefined>): SelectElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    size(value: string | Stateful<string | undefined>): SelectElementAttributes;
}

export interface SlotElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SourceElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): SourceElementAttributes;
    media(value: string | Stateful<string | undefined>): SourceElementAttributes;
    sizes(value: string | Stateful<string | undefined>): SourceElementAttributes;
    src(value: string | Stateful<string | undefined>): SourceElementAttributes;
    srcset(value: string | Stateful<string | undefined>): SourceElementAttributes;
    type(value: string | Stateful<string | undefined>): SourceElementAttributes;
    width(value: string | Stateful<string | undefined>): SourceElementAttributes;
}

export interface SpanElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface StrongElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface StyleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    blocking(value: string | Stateful<string | undefined>): StyleElementAttributes;
    media(value: string | Stateful<string | undefined>): StyleElementAttributes;
    type(value: string | Stateful<string | undefined>): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SummaryElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface TableElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TableElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TableElementAttributes;
    border(value: string | Stateful<string | undefined>): TableElementAttributes;
    cellpadding(value: string | Stateful<string | undefined>): TableElementAttributes;
    cellspacing(value: string | Stateful<string | undefined>): TableElementAttributes;
    frame(value: string | Stateful<string | undefined>): TableElementAttributes;
    rules(value: string | Stateful<string | undefined>): TableElementAttributes;
    summary(value: string | Stateful<string | undefined>): TableElementAttributes;
    width(value: string | Stateful<string | undefined>): TableElementAttributes;
}

export interface TbodyElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    char(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    valign(value: string | Stateful<string | undefined>): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string | undefined>): TdElementAttributes;
    align(value: string | Stateful<string | undefined>): TdElementAttributes;
    axis(value: string | Stateful<string | undefined>): TdElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TdElementAttributes;
    char(value: string | Stateful<string | undefined>): TdElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TdElementAttributes;
    colspan(value: string | Stateful<string | undefined>): TdElementAttributes;
    headers(value: string | Stateful<string | undefined>): TdElementAttributes;
    height(value: string | Stateful<string | undefined>): TdElementAttributes;
    nowrap(value: string | Stateful<string | undefined>): TdElementAttributes;
    rowspan(value: string | Stateful<string | undefined>): TdElementAttributes;
    scope(value: string | Stateful<string | undefined>): TdElementAttributes;
    valign(value: string | Stateful<string | undefined>): TdElementAttributes;
    width(value: string | Stateful<string | undefined>): TdElementAttributes;
}

export interface TemplateElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    shadowrootclonable(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootdelegatesfocus(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootmode(value: string | Stateful<string | undefined>): TemplateElementAttributes;
}

export interface TextareaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    cols(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    dirname(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    form(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    maxlength(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    minlength(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    name(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    placeholder(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    readonly(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    rows(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    wrap(value: string | Stateful<string | undefined>): TextareaElementAttributes;
}

export interface TfootElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TfootElementAttributes;
    char(value: string | Stateful<string | undefined>): TfootElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TfootElementAttributes;
    valign(value: string | Stateful<string | undefined>): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string | undefined>): ThElementAttributes;
    align(value: string | Stateful<string | undefined>): ThElementAttributes;
    axis(value: string | Stateful<string | undefined>): ThElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): ThElementAttributes;
    char(value: string | Stateful<string | undefined>): ThElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ThElementAttributes;
    colspan(value: string | Stateful<string | undefined>): ThElementAttributes;
    headers(value: string | Stateful<string | undefined>): ThElementAttributes;
    height(value: string | Stateful<string | undefined>): ThElementAttributes;
    nowrap(value: string | Stateful<string | undefined>): ThElementAttributes;
    rowspan(value: string | Stateful<string | undefined>): ThElementAttributes;
    scope(value: string | Stateful<string | undefined>): ThElementAttributes;
    valign(value: string | Stateful<string | undefined>): ThElementAttributes;
    width(value: string | Stateful<string | undefined>): ThElementAttributes;
}

export interface TheadElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TheadElementAttributes;
    char(value: string | Stateful<string | undefined>): TheadElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TheadElementAttributes;
    valign(value: string | Stateful<string | undefined>): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    datetime(value: string | Stateful<string | undefined>): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface TrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TrElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TrElementAttributes;
    char(value: string | Stateful<string | undefined>): TrElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TrElementAttributes;
    valign(value: string | Stateful<string | undefined>): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    default(value: boolean | Stateful<boolean | undefined>): TrackElementAttributes;
    kind(value: string | Stateful<string | undefined>): TrackElementAttributes;
    label(value: string | Stateful<string | undefined>): TrackElementAttributes;
    src(value: string | Stateful<string | undefined>): TrackElementAttributes;
    srclang(value: string | Stateful<string | undefined>): TrackElementAttributes;
}

export interface UElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface UlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): UlElementAttributes;
    type(value: string | Stateful<string | undefined>): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface VideoElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    controls(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): VideoElementAttributes;
    height(value: string | Stateful<string | undefined>): VideoElementAttributes;
    loop(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    muted(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    playsinline(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    poster(value: string | Stateful<string | undefined>): VideoElementAttributes;
    preload(value: string | Stateful<string | undefined>): VideoElementAttributes;
    src(value: string | Stateful<string | undefined>): VideoElementAttributes;
    width(value: string | Stateful<string | undefined>): VideoElementAttributes;
}

export interface WbrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}
