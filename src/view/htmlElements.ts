import { ConfigurableElement } from "./render/viewRenderer.js";
import { GetState, State, Stateful } from "../store/index.js";
import { SpecialElementAttributes } from "./specialAttributes.js";

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
    withUnion<T>(state: State<T>): HTMLCaseSelector<T>;
    withConditions(): HTMLConditionSelector;
}

export interface SpecialHTMLElements {
    element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements>) => void): this;
    textNode(value: string | Stateful<string>): this;
    subview(value: HTMLView): this;
    subviewFrom(selectorGenerator: (selector: HTMLViewSelector) => void): this;
    subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this;
}

export interface GlobalHTMLAttributes {
    accesskey(value: string | Stateful<string>): this;
    autocapitalize(value: string | Stateful<string>): this;
    autofocus(value: boolean | Stateful<boolean>): this;
    class(value: string | Stateful<string>): this;
    contenteditable(value: string | Stateful<string>): this;
    dir(value: string | Stateful<string>): this;
    draggable(value: string | Stateful<string>): this;
    enterkeyhint(value: string | Stateful<string>): this;
    hidden(value: string | Stateful<string>): this;
    id(value: string | Stateful<string>): this;
    inert(value: boolean | Stateful<boolean>): this;
    inputmode(value: string | Stateful<string>): this;
    is(value: string | Stateful<string>): this;
    itemid(value: string | Stateful<string>): this;
    itemprop(value: string | Stateful<string>): this;
    itemref(value: string | Stateful<string>): this;
    itemscope(value: boolean | Stateful<boolean>): this;
    itemtype(value: string | Stateful<string>): this;
    lang(value: string | Stateful<string>): this;
    nonce(value: string | Stateful<string>): this;
    popover(value: string | Stateful<string>): this;
    slot(value: string | Stateful<string>): this;
    spellcheck(value: string | Stateful<string>): this;
    style(value: string | Stateful<string>): this;
    tabindex(value: string | Stateful<string>): this;
    title(value: string | Stateful<string>): this;
    translate(value: string | Stateful<string>): this;
    writingsuggestions(value: string | Stateful<string>): this;
    role(value: string | Stateful<string>): this;
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
    charset(value: string | Stateful<string>): AElementAttributes;
    coords(value: string | Stateful<string>): AElementAttributes;
    download(value: string | Stateful<string>): AElementAttributes;
    href(value: string | Stateful<string>): AElementAttributes;
    hreflang(value: string | Stateful<string>): AElementAttributes;
    name(value: string | Stateful<string>): AElementAttributes;
    ping(value: string | Stateful<string>): AElementAttributes;
    referrerpolicy(value: string | Stateful<string>): AElementAttributes;
    rel(value: string | Stateful<string>): AElementAttributes;
    rev(value: string | Stateful<string>): AElementAttributes;
    shape(value: string | Stateful<string>): AElementAttributes;
    target(value: string | Stateful<string>): AElementAttributes;
    type(value: string | Stateful<string>): AElementAttributes;
}

export interface AbbrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AddressElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AreaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    alt(value: string | Stateful<string>): AreaElementAttributes;
    coords(value: string | Stateful<string>): AreaElementAttributes;
    download(value: string | Stateful<string>): AreaElementAttributes;
    href(value: string | Stateful<string>): AreaElementAttributes;
    hreflang(value: string | Stateful<string>): AreaElementAttributes;
    nohref(value: string | Stateful<string>): AreaElementAttributes;
    ping(value: string | Stateful<string>): AreaElementAttributes;
    referrerpolicy(value: string | Stateful<string>): AreaElementAttributes;
    rel(value: string | Stateful<string>): AreaElementAttributes;
    shape(value: string | Stateful<string>): AreaElementAttributes;
    target(value: string | Stateful<string>): AreaElementAttributes;
    type(value: string | Stateful<string>): AreaElementAttributes;
}

export interface ArticleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AsideElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface AudioElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean>): AudioElementAttributes;
    controls(value: boolean | Stateful<boolean>): AudioElementAttributes;
    crossorigin(value: string | Stateful<string>): AudioElementAttributes;
    loop(value: boolean | Stateful<boolean>): AudioElementAttributes;
    muted(value: boolean | Stateful<boolean>): AudioElementAttributes;
    preload(value: string | Stateful<string>): AudioElementAttributes;
    src(value: string | Stateful<string>): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BaseElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    href(value: string | Stateful<string>): BaseElementAttributes;
    target(value: string | Stateful<string>): BaseElementAttributes;
}

export interface BdiElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BdoElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface BlockquoteElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    alink(value: string | Stateful<string>): BodyElementAttributes;
    background(value: string | Stateful<string>): BodyElementAttributes;
    bgcolor(value: string | Stateful<string>): BodyElementAttributes;
    link(value: string | Stateful<string>): BodyElementAttributes;
    text(value: string | Stateful<string>): BodyElementAttributes;
    vlink(value: string | Stateful<string>): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    clear(value: string | Stateful<string>): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): ButtonElementAttributes;
    form(value: string | Stateful<string>): ButtonElementAttributes;
    formaction(value: string | Stateful<string>): ButtonElementAttributes;
    formenctype(value: string | Stateful<string>): ButtonElementAttributes;
    formmethod(value: string | Stateful<string>): ButtonElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean>): ButtonElementAttributes;
    formtarget(value: string | Stateful<string>): ButtonElementAttributes;
    name(value: string | Stateful<string>): ButtonElementAttributes;
    popovertarget(value: string | Stateful<string>): ButtonElementAttributes;
    popovertargetaction(value: string | Stateful<string>): ButtonElementAttributes;
    type(value: string | Stateful<string>): ButtonElementAttributes;
    value(value: string | Stateful<string>): ButtonElementAttributes;
}

export interface CanvasElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): CanvasElementAttributes;
    width(value: string | Stateful<string>): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): CaptionElementAttributes;
}

export interface CiteElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface CodeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface ColElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ColElementAttributes;
    char(value: string | Stateful<string>): ColElementAttributes;
    charoff(value: string | Stateful<string>): ColElementAttributes;
    span(value: string | Stateful<string>): ColElementAttributes;
    valign(value: string | Stateful<string>): ColElementAttributes;
    width(value: string | Stateful<string>): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ColgroupElementAttributes;
    char(value: string | Stateful<string>): ColgroupElementAttributes;
    charoff(value: string | Stateful<string>): ColgroupElementAttributes;
    span(value: string | Stateful<string>): ColgroupElementAttributes;
    valign(value: string | Stateful<string>): ColgroupElementAttributes;
    width(value: string | Stateful<string>): ColgroupElementAttributes;
}

export interface DataElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    value(value: string | Stateful<string>): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DelElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): DelElementAttributes;
    datetime(value: string | Stateful<string>): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): DetailsElementAttributes;
    open(value: boolean | Stateful<boolean>): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface DialogElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    open(value: boolean | Stateful<boolean>): DialogElementAttributes;
}

export interface DivElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface EmElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface EmbedElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): EmbedElementAttributes;
    src(value: string | Stateful<string>): EmbedElementAttributes;
    type(value: string | Stateful<string>): EmbedElementAttributes;
    width(value: string | Stateful<string>): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): FieldsetElementAttributes;
    form(value: string | Stateful<string>): FieldsetElementAttributes;
    name(value: string | Stateful<string>): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FigureElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FooterElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface FormElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string>): FormElementAttributes;
    acceptCharset(value: string | Stateful<string>): FormElementAttributes;
    action(value: string | Stateful<string>): FormElementAttributes;
    autocomplete(value: string | Stateful<string>): FormElementAttributes;
    enctype(value: string | Stateful<string>): FormElementAttributes;
    method(value: string | Stateful<string>): FormElementAttributes;
    name(value: string | Stateful<string>): FormElementAttributes;
    novalidate(value: boolean | Stateful<boolean>): FormElementAttributes;
    target(value: string | Stateful<string>): FormElementAttributes;
}

export interface H1ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    profile(value: string | Stateful<string>): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface HgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface HrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): HrElementAttributes;
    noshade(value: string | Stateful<string>): HrElementAttributes;
    size(value: string | Stateful<string>): HrElementAttributes;
    width(value: string | Stateful<string>): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    manifest(value: string | Stateful<string>): HtmlElementAttributes;
    version(value: string | Stateful<string>): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface IframeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): IframeElementAttributes;
    allow(value: string | Stateful<string>): IframeElementAttributes;
    allowfullscreen(value: boolean | Stateful<boolean>): IframeElementAttributes;
    allowpaymentrequest(value: string | Stateful<string>): IframeElementAttributes;
    allowusermedia(value: string | Stateful<string>): IframeElementAttributes;
    frameborder(value: string | Stateful<string>): IframeElementAttributes;
    height(value: string | Stateful<string>): IframeElementAttributes;
    loading(value: string | Stateful<string>): IframeElementAttributes;
    longdesc(value: string | Stateful<string>): IframeElementAttributes;
    marginheight(value: string | Stateful<string>): IframeElementAttributes;
    marginwidth(value: string | Stateful<string>): IframeElementAttributes;
    name(value: string | Stateful<string>): IframeElementAttributes;
    referrerpolicy(value: string | Stateful<string>): IframeElementAttributes;
    sandbox(value: string | Stateful<string>): IframeElementAttributes;
    scrolling(value: string | Stateful<string>): IframeElementAttributes;
    src(value: string | Stateful<string>): IframeElementAttributes;
    srcdoc(value: string | Stateful<string>): IframeElementAttributes;
    width(value: string | Stateful<string>): IframeElementAttributes;
}

export interface ImgElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ImgElementAttributes;
    alt(value: string | Stateful<string>): ImgElementAttributes;
    border(value: string | Stateful<string>): ImgElementAttributes;
    crossorigin(value: string | Stateful<string>): ImgElementAttributes;
    decoding(value: string | Stateful<string>): ImgElementAttributes;
    fetchpriority(value: string | Stateful<string>): ImgElementAttributes;
    height(value: string | Stateful<string>): ImgElementAttributes;
    hspace(value: string | Stateful<string>): ImgElementAttributes;
    ismap(value: boolean | Stateful<boolean>): ImgElementAttributes;
    loading(value: string | Stateful<string>): ImgElementAttributes;
    longdesc(value: string | Stateful<string>): ImgElementAttributes;
    name(value: string | Stateful<string>): ImgElementAttributes;
    referrerpolicy(value: string | Stateful<string>): ImgElementAttributes;
    sizes(value: string | Stateful<string>): ImgElementAttributes;
    src(value: string | Stateful<string>): ImgElementAttributes;
    srcset(value: string | Stateful<string>): ImgElementAttributes;
    usemap(value: string | Stateful<string>): ImgElementAttributes;
    vspace(value: string | Stateful<string>): ImgElementAttributes;
    width(value: string | Stateful<string>): ImgElementAttributes;
}

export interface InputElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string>): InputElementAttributes;
    align(value: string | Stateful<string>): InputElementAttributes;
    alt(value: string | Stateful<string>): InputElementAttributes;
    autocomplete(value: string | Stateful<string>): InputElementAttributes;
    checked(value: boolean | Stateful<boolean>): InputElementAttributes;
    dirname(value: string | Stateful<string>): InputElementAttributes;
    disabled(value: boolean | Stateful<boolean>): InputElementAttributes;
    form(value: string | Stateful<string>): InputElementAttributes;
    formaction(value: string | Stateful<string>): InputElementAttributes;
    formenctype(value: string | Stateful<string>): InputElementAttributes;
    formmethod(value: string | Stateful<string>): InputElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean>): InputElementAttributes;
    formtarget(value: string | Stateful<string>): InputElementAttributes;
    height(value: string | Stateful<string>): InputElementAttributes;
    ismap(value: boolean | Stateful<boolean>): InputElementAttributes;
    list(value: string | Stateful<string>): InputElementAttributes;
    max(value: string | Stateful<string>): InputElementAttributes;
    maxlength(value: string | Stateful<string>): InputElementAttributes;
    min(value: string | Stateful<string>): InputElementAttributes;
    minlength(value: string | Stateful<string>): InputElementAttributes;
    multiple(value: boolean | Stateful<boolean>): InputElementAttributes;
    name(value: string | Stateful<string>): InputElementAttributes;
    pattern(value: string | Stateful<string>): InputElementAttributes;
    placeholder(value: string | Stateful<string>): InputElementAttributes;
    popovertarget(value: string | Stateful<string>): InputElementAttributes;
    popovertargetaction(value: string | Stateful<string>): InputElementAttributes;
    readonly(value: boolean | Stateful<boolean>): InputElementAttributes;
    required(value: boolean | Stateful<boolean>): InputElementAttributes;
    size(value: string | Stateful<string>): InputElementAttributes;
    src(value: string | Stateful<string>): InputElementAttributes;
    step(value: string | Stateful<string>): InputElementAttributes;
    type(value: string | Stateful<string>): InputElementAttributes;
    usemap(value: string | Stateful<string>): InputElementAttributes;
    value(value: string | Stateful<string>): InputElementAttributes;
    width(value: string | Stateful<string>): InputElementAttributes;
}

export interface InsElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): InsElementAttributes;
    datetime(value: string | Stateful<string>): InsElementAttributes;
}

export interface KbdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface LabelElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string>): LabelElementAttributes;
    form(value: string | Stateful<string>): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    type(value: string | Stateful<string>): LiElementAttributes;
    value(value: string | Stateful<string>): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    as(value: string | Stateful<string>): LinkElementAttributes;
    blocking(value: string | Stateful<string>): LinkElementAttributes;
    charset(value: string | Stateful<string>): LinkElementAttributes;
    color(value: string | Stateful<string>): LinkElementAttributes;
    crossorigin(value: string | Stateful<string>): LinkElementAttributes;
    disabled(value: boolean | Stateful<boolean>): LinkElementAttributes;
    fetchpriority(value: string | Stateful<string>): LinkElementAttributes;
    href(value: string | Stateful<string>): LinkElementAttributes;
    hreflang(value: string | Stateful<string>): LinkElementAttributes;
    imagesizes(value: string | Stateful<string>): LinkElementAttributes;
    imagesrcset(value: string | Stateful<string>): LinkElementAttributes;
    integrity(value: string | Stateful<string>): LinkElementAttributes;
    media(value: string | Stateful<string>): LinkElementAttributes;
    referrerpolicy(value: string | Stateful<string>): LinkElementAttributes;
    rel(value: string | Stateful<string>): LinkElementAttributes;
    rev(value: string | Stateful<string>): LinkElementAttributes;
    sizes(value: string | Stateful<string>): LinkElementAttributes;
    target(value: string | Stateful<string>): LinkElementAttributes;
    type(value: string | Stateful<string>): LinkElementAttributes;
}

export interface MainElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MapElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MathElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MenuElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface MetaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    charset(value: string | Stateful<string>): MetaElementAttributes;
    content(value: string | Stateful<string>): MetaElementAttributes;
    httpEquiv(value: string | Stateful<string>): MetaElementAttributes;
    media(value: string | Stateful<string>): MetaElementAttributes;
    name(value: string | Stateful<string>): MetaElementAttributes;
    scheme(value: string | Stateful<string>): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    high(value: string | Stateful<string>): MeterElementAttributes;
    low(value: string | Stateful<string>): MeterElementAttributes;
    max(value: string | Stateful<string>): MeterElementAttributes;
    min(value: string | Stateful<string>): MeterElementAttributes;
    optimum(value: string | Stateful<string>): MeterElementAttributes;
    value(value: string | Stateful<string>): MeterElementAttributes;
}

export interface NavElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface NoscriptElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface ObjectElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ObjectElementAttributes;
    archive(value: string | Stateful<string>): ObjectElementAttributes;
    border(value: string | Stateful<string>): ObjectElementAttributes;
    classid(value: string | Stateful<string>): ObjectElementAttributes;
    codebase(value: string | Stateful<string>): ObjectElementAttributes;
    codetype(value: string | Stateful<string>): ObjectElementAttributes;
    data(value: string | Stateful<string>): ObjectElementAttributes;
    declare(value: string | Stateful<string>): ObjectElementAttributes;
    form(value: string | Stateful<string>): ObjectElementAttributes;
    height(value: string | Stateful<string>): ObjectElementAttributes;
    hspace(value: string | Stateful<string>): ObjectElementAttributes;
    name(value: string | Stateful<string>): ObjectElementAttributes;
    standby(value: string | Stateful<string>): ObjectElementAttributes;
    type(value: string | Stateful<string>): ObjectElementAttributes;
    typemustmatch(value: string | Stateful<string>): ObjectElementAttributes;
    usemap(value: string | Stateful<string>): ObjectElementAttributes;
    vspace(value: string | Stateful<string>): ObjectElementAttributes;
    width(value: string | Stateful<string>): ObjectElementAttributes;
}

export interface OlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): OlElementAttributes;
    reversed(value: boolean | Stateful<boolean>): OlElementAttributes;
    start(value: string | Stateful<string>): OlElementAttributes;
    type(value: string | Stateful<string>): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): OptgroupElementAttributes;
    label(value: string | Stateful<string>): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): OptionElementAttributes;
    label(value: string | Stateful<string>): OptionElementAttributes;
    selected(value: boolean | Stateful<boolean>): OptionElementAttributes;
    value(value: string | Stateful<string>): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string>): OutputElementAttributes;
    form(value: string | Stateful<string>): OutputElementAttributes;
    name(value: string | Stateful<string>): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): ParamElementAttributes;
    type(value: string | Stateful<string>): ParamElementAttributes;
    value(value: string | Stateful<string>): ParamElementAttributes;
    valuetype(value: string | Stateful<string>): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface PreElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    width(value: string | Stateful<string>): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    max(value: string | Stateful<string>): ProgressElementAttributes;
    value(value: string | Stateful<string>): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): QElementAttributes;
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
    async(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    blocking(value: string | Stateful<string>): ScriptElementAttributes;
    charset(value: string | Stateful<string>): ScriptElementAttributes;
    crossorigin(value: string | Stateful<string>): ScriptElementAttributes;
    defer(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    fetchpriority(value: string | Stateful<string>): ScriptElementAttributes;
    integrity(value: string | Stateful<string>): ScriptElementAttributes;
    language(value: string | Stateful<string>): ScriptElementAttributes;
    nomodule(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    referrerpolicy(value: string | Stateful<string>): ScriptElementAttributes;
    src(value: string | Stateful<string>): ScriptElementAttributes;
    type(value: string | Stateful<string>): ScriptElementAttributes;
}

export interface SearchElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SectionElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SelectElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string>): SelectElementAttributes;
    disabled(value: boolean | Stateful<boolean>): SelectElementAttributes;
    form(value: string | Stateful<string>): SelectElementAttributes;
    multiple(value: boolean | Stateful<boolean>): SelectElementAttributes;
    name(value: string | Stateful<string>): SelectElementAttributes;
    required(value: boolean | Stateful<boolean>): SelectElementAttributes;
    size(value: string | Stateful<string>): SelectElementAttributes;
}

export interface SlotElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SourceElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): SourceElementAttributes;
    media(value: string | Stateful<string>): SourceElementAttributes;
    sizes(value: string | Stateful<string>): SourceElementAttributes;
    src(value: string | Stateful<string>): SourceElementAttributes;
    srcset(value: string | Stateful<string>): SourceElementAttributes;
    type(value: string | Stateful<string>): SourceElementAttributes;
    width(value: string | Stateful<string>): SourceElementAttributes;
}

export interface SpanElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface StrongElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface StyleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    blocking(value: string | Stateful<string>): StyleElementAttributes;
    media(value: string | Stateful<string>): StyleElementAttributes;
    type(value: string | Stateful<string>): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SummaryElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface SupElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface TableElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TableElementAttributes;
    bgcolor(value: string | Stateful<string>): TableElementAttributes;
    border(value: string | Stateful<string>): TableElementAttributes;
    cellpadding(value: string | Stateful<string>): TableElementAttributes;
    cellspacing(value: string | Stateful<string>): TableElementAttributes;
    frame(value: string | Stateful<string>): TableElementAttributes;
    rules(value: string | Stateful<string>): TableElementAttributes;
    summary(value: string | Stateful<string>): TableElementAttributes;
    width(value: string | Stateful<string>): TableElementAttributes;
}

export interface TbodyElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TbodyElementAttributes;
    char(value: string | Stateful<string>): TbodyElementAttributes;
    charoff(value: string | Stateful<string>): TbodyElementAttributes;
    valign(value: string | Stateful<string>): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string>): TdElementAttributes;
    align(value: string | Stateful<string>): TdElementAttributes;
    axis(value: string | Stateful<string>): TdElementAttributes;
    bgcolor(value: string | Stateful<string>): TdElementAttributes;
    char(value: string | Stateful<string>): TdElementAttributes;
    charoff(value: string | Stateful<string>): TdElementAttributes;
    colspan(value: string | Stateful<string>): TdElementAttributes;
    headers(value: string | Stateful<string>): TdElementAttributes;
    height(value: string | Stateful<string>): TdElementAttributes;
    nowrap(value: string | Stateful<string>): TdElementAttributes;
    rowspan(value: string | Stateful<string>): TdElementAttributes;
    scope(value: string | Stateful<string>): TdElementAttributes;
    valign(value: string | Stateful<string>): TdElementAttributes;
    width(value: string | Stateful<string>): TdElementAttributes;
}

export interface TemplateElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    shadowrootclonable(value: string | Stateful<string>): TemplateElementAttributes;
    shadowrootdelegatesfocus(value: string | Stateful<string>): TemplateElementAttributes;
    shadowrootmode(value: string | Stateful<string>): TemplateElementAttributes;
}

export interface TextareaElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string>): TextareaElementAttributes;
    cols(value: string | Stateful<string>): TextareaElementAttributes;
    dirname(value: string | Stateful<string>): TextareaElementAttributes;
    disabled(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    form(value: string | Stateful<string>): TextareaElementAttributes;
    maxlength(value: string | Stateful<string>): TextareaElementAttributes;
    minlength(value: string | Stateful<string>): TextareaElementAttributes;
    name(value: string | Stateful<string>): TextareaElementAttributes;
    placeholder(value: string | Stateful<string>): TextareaElementAttributes;
    readonly(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    required(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    rows(value: string | Stateful<string>): TextareaElementAttributes;
    wrap(value: string | Stateful<string>): TextareaElementAttributes;
}

export interface TfootElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TfootElementAttributes;
    char(value: string | Stateful<string>): TfootElementAttributes;
    charoff(value: string | Stateful<string>): TfootElementAttributes;
    valign(value: string | Stateful<string>): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string>): ThElementAttributes;
    align(value: string | Stateful<string>): ThElementAttributes;
    axis(value: string | Stateful<string>): ThElementAttributes;
    bgcolor(value: string | Stateful<string>): ThElementAttributes;
    char(value: string | Stateful<string>): ThElementAttributes;
    charoff(value: string | Stateful<string>): ThElementAttributes;
    colspan(value: string | Stateful<string>): ThElementAttributes;
    headers(value: string | Stateful<string>): ThElementAttributes;
    height(value: string | Stateful<string>): ThElementAttributes;
    nowrap(value: string | Stateful<string>): ThElementAttributes;
    rowspan(value: string | Stateful<string>): ThElementAttributes;
    scope(value: string | Stateful<string>): ThElementAttributes;
    valign(value: string | Stateful<string>): ThElementAttributes;
    width(value: string | Stateful<string>): ThElementAttributes;
}

export interface TheadElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TheadElementAttributes;
    char(value: string | Stateful<string>): TheadElementAttributes;
    charoff(value: string | Stateful<string>): TheadElementAttributes;
    valign(value: string | Stateful<string>): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    datetime(value: string | Stateful<string>): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface TrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TrElementAttributes;
    bgcolor(value: string | Stateful<string>): TrElementAttributes;
    char(value: string | Stateful<string>): TrElementAttributes;
    charoff(value: string | Stateful<string>): TrElementAttributes;
    valign(value: string | Stateful<string>): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    default(value: boolean | Stateful<boolean>): TrackElementAttributes;
    kind(value: string | Stateful<string>): TrackElementAttributes;
    label(value: string | Stateful<string>): TrackElementAttributes;
    src(value: string | Stateful<string>): TrackElementAttributes;
    srclang(value: string | Stateful<string>): TrackElementAttributes;
}

export interface UElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface UlElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): UlElementAttributes;
    type(value: string | Stateful<string>): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}

export interface VideoElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean>): VideoElementAttributes;
    controls(value: boolean | Stateful<boolean>): VideoElementAttributes;
    crossorigin(value: string | Stateful<string>): VideoElementAttributes;
    height(value: string | Stateful<string>): VideoElementAttributes;
    loop(value: boolean | Stateful<boolean>): VideoElementAttributes;
    muted(value: boolean | Stateful<boolean>): VideoElementAttributes;
    playsinline(value: boolean | Stateful<boolean>): VideoElementAttributes;
    poster(value: string | Stateful<string>): VideoElementAttributes;
    preload(value: string | Stateful<string>): VideoElementAttributes;
    src(value: string | Stateful<string>): VideoElementAttributes;
    width(value: string | Stateful<string>): VideoElementAttributes;
}

export interface WbrElementAttributes extends SpecialElementAttributes, GlobalHTMLAttributes {
}
